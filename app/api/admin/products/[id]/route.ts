import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '../../../../lib/prisma';
import { getAuthContext, hasPermission } from '../../../../lib/rbac/middleware';
import { Resource, Action } from '../../../../lib/rbac/permissions';

const updateProductSchema = z.object({
  nameEn: z.string().min(1).max(255).optional(),
  nameSw: z.string().max(255).optional(),
  descriptionEn: z.string().optional(),
  category: z.string().optional(),
  productType: z.enum(['wholesale', 'retail', 'both']).optional(),
  wholesalePrice: z.number().min(0).optional(),
  retailPrice: z.number().min(0).optional(),
  costPrice: z.number().min(0).optional(),
  sku: z.string().max(100).optional(),
  barcode: z.string().max(100).optional(),
  unit: z.string().max(50).optional(),
  currentStock: z.number().min(0).optional(),
  minimumStock: z.number().min(0).optional(),
  reorderLevel: z.number().min(0).optional(),
  maxStock: z.number().min(0).optional(),
  location: z.string().max(255).optional(),
  stockAlerts: z.boolean().optional(),

  images: z.array(z.object({
    id: z.number().optional(),
    url: z.string().regex(/^\//, 'Must be a relative path'),
    filename: z.string(),
    originalName: z.string(),
    size: z.number(),
    type: z.string(),
    isPrimary: z.boolean().optional(),
    sortOrder: z.number().optional()
  })).optional(),
  isActive: z.boolean().optional(),
  isDraft: z.boolean().optional()
});

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const productId = parseInt(params.id);
    if (isNaN(productId)) {
      return NextResponse.json({ success: false, message: 'Invalid product ID' }, { status: 400 });
    }
    
    // Get auth context
    const authContext = await getAuthContext(request);
    if (!authContext) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }
    
    // First get the product to check business ownership
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        category: { select: { id: true, name: true, nameSwahili: true } },
        inventory: true,
        images: { orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }] }
      }
    });
    
    if (!product) {
      return NextResponse.json({ success: false, message: 'Product not found' }, { status: 404 });
    }
    
    // Verify business ownership - check if user is owner or has permissions
    const isOwner = await prisma.business.findFirst({
      where: {
        id: product.businessId,
        ownerId: authContext.userId,
        isActive: true
      }
    });
    
    const hasPermission = await prisma.userPermission.findFirst({
      where: {
        userId: authContext.userId,
        businessId: product.businessId,
        isActive: true
      }
    });
    
    if (!isOwner && !hasPermission) {
      return NextResponse.json({ success: false, message: 'Access denied' }, { status: 403 });
    }
    
    console.log('Product loaded:', product.name);
    console.log('Inventory count:', product.inventory?.length || 0);
    
    return NextResponse.json({ success: true, data: product });
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch product' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const productId = parseInt(params.id);
    if (isNaN(productId)) {
      return NextResponse.json({ success: false, message: 'Invalid product ID' }, { status: 400 });
    }
    
    const authContext = await getAuthContext(request);
    if (!authContext) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }
    
    // First get the product to check business ownership
    const existingProduct = await prisma.product.findUnique({
      where: { id: productId }
    });
    
    if (!existingProduct) {
      return NextResponse.json({ success: false, message: 'Product not found' }, { status: 404 });
    }
    
    // Verify business ownership - check if user is owner or has permissions
    const isOwner = await prisma.business.findFirst({
      where: {
        id: existingProduct.businessId,
        ownerId: authContext.userId,
        isActive: true
      }
    });
    
    const userPermission = await prisma.userPermission.findFirst({
      where: {
        userId: authContext.userId,
        businessId: existingProduct.businessId,
        isActive: true
      }
    });
    
    if (!isOwner && !userPermission) {
      return NextResponse.json({ success: false, message: 'Access denied' }, { status: 403 });
    }
    
    // Check permission
    const hasAccess = await hasPermission(authContext, Resource.PRODUCTS, Action.UPDATE, existingProduct.businessId);
    if (!hasAccess) {
      return NextResponse.json({ success: false, message: 'No permission' }, { status: 403 });
    }
    
    const body = await request.json();
    console.log('Request body received:', body);
    
    const validationResult = updateProductSchema.safeParse(body);
    if (!validationResult.success) {
      console.log('Validation errors:', validationResult.error.format());
      return NextResponse.json({ success: false, message: 'Validation failed', errors: validationResult.error.format() }, { status: 400 });
    }
    
    const data = validationResult.data;
    console.log('Validated data:', data);
    
    // Find category if changed
    if (data.category) {
      const categoryId = parseInt(data.category, 10);
      if (!isNaN(categoryId)) {
        const category = await prisma.category.findFirst({
          where: { businessId: existingProduct.businessId, id: categoryId }
        });
        if (!category) {
          return NextResponse.json({ success: false, message: 'Category not found' }, { status: 400 });
        }
      }
    }
    
    // Update product, inventory, and images in transaction
    const updatedProduct = await prisma.$transaction(async (tx) => {
      // Prepare update data for product - only include fields that exist in schema
      const productUpdateData: {
        name?: string;
        nameSwahili?: string;
        description?: string;
        category?: { connect: { id: number } };
        wholesalePrice?: number;
        price?: number;
        costPrice?: number;
        sku?: string;
        barcode?: string;
        unit?: string;

        isActive?: boolean;
        isDraft?: boolean;
      } = {};
      
      if (data.nameEn) productUpdateData.name = data.nameEn;
      if (data.nameSw) productUpdateData.nameSwahili = data.nameSw;
      if (data.descriptionEn) productUpdateData.description = data.descriptionEn;
      if (data.category && data.category !== '') {
        productUpdateData.category = { 
          connect: { 
            id: parseInt(data.category, 10) 
          } 
        };
      }
      if (data.wholesalePrice !== undefined) productUpdateData.wholesalePrice = data.wholesalePrice;
      if (data.retailPrice !== undefined) productUpdateData.price = data.retailPrice;
      if (data.costPrice !== undefined) productUpdateData.costPrice = data.costPrice;
      if (data.sku !== undefined) productUpdateData.sku = data.sku;
      if (data.barcode !== undefined) productUpdateData.barcode = data.barcode;
      if (data.unit !== undefined) productUpdateData.unit = data.unit;
      if (data.isActive !== undefined) productUpdateData.isActive = data.isActive;
      if (data.isDraft !== undefined) productUpdateData.isDraft = data.isDraft;
      
      console.log('Sending to Prisma:', productUpdateData);
      
      // Update product
      const product = await tx.product.update({
        where: { id: productId },
        data: productUpdateData
      });
      
      // Update inventory
      if (data.currentStock !== undefined || data.reorderLevel !== undefined || data.minimumStock !== undefined || data.maxStock !== undefined || data.location !== undefined) {
        await tx.inventory.upsert({
          where: { businessId_productId: { businessId: existingProduct.businessId, productId } },
          create: {
            businessId: existingProduct.businessId,
            productId,
            quantity: data.currentStock !== undefined ? data.currentStock : 0,
            reorderPoint: data.reorderLevel ?? null,
            maxStock: data.maxStock || 1000,
            location: data.location || 'Default'
          },
          update: {
            ...(data.currentStock !== undefined && { quantity: data.currentStock }),
            ...(data.reorderLevel !== undefined && { reorderPoint: data.reorderLevel ?? null }),
            ...(data.maxStock !== undefined && { maxStock: data.maxStock }),
            ...(data.location !== undefined && { location: data.location })
          }
        });
      }
      
      // Handle images
      if (data.images) {
        // Delete images not in new list
        const existingImages = await tx.productImage.findMany({ where: { productId } });
        const newImageIds = data.images.filter(img => img.id).map(img => img.id);
        const toDelete = existingImages.filter(img => !newImageIds.includes(img.id));
        if (toDelete.length > 0) {
          await tx.productImage.deleteMany({ where: { id: { in: toDelete.map(img => img.id) } } });
        }
        
        // Upsert new/updated images
        for (let i = 0; i < data.images.length; i++) {
          const img = data.images[i];
          if (img.id) {
            await tx.productImage.update({
              where: { id: img.id },
              data: {
                url: img.url,
                filename: img.filename,
                originalName: img.originalName,
                size: img.size,
                mimeType: img.type,
                isPrimary: img.isPrimary ?? false,
                sortOrder: img.sortOrder ?? i
              }
            });
          } else {
            await tx.productImage.create({
              data: {
                productId,
                url: img.url,
                filename: img.filename,
                originalName: img.originalName,
                size: img.size,
                mimeType: img.type,
                isPrimary: img.isPrimary ?? false,
                sortOrder: img.sortOrder ?? i
              }
            });
          }
        }
      }
      
      return product;
    });
    
    return NextResponse.json({ success: true, message: 'Product updated', data: updatedProduct });
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json({ success: false, message: 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const productId = parseInt(params.id);
    if (isNaN(productId)) {
      return NextResponse.json({ success: false, message: 'Invalid product ID' }, { status: 400 });
    }

    const authContext = await getAuthContext(request);
    if (!authContext) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    // First get the product to check business ownership
    const existingProduct = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!existingProduct) {
      return NextResponse.json({ success: false, message: 'Product not found' }, { status: 404 });
    }

    // Verify business ownership - check if user is owner or has permissions
    const isOwner = await prisma.business.findFirst({
      where: {
        id: existingProduct.businessId,
        ownerId: authContext.userId,
        isActive: true
      }
    });
    
    const userPermission = await prisma.userPermission.findFirst({
      where: {
        userId: authContext.userId,
        businessId: existingProduct.businessId,
        isActive: true
      }
    });
    
    if (!isOwner && !userPermission) {
      return NextResponse.json({ success: false, message: 'Access denied' }, { status: 403 });
    }

    // Check permission
    const hasAccess = await hasPermission(authContext, Resource.PRODUCTS, Action.DELETE, existingProduct.businessId);
    if (!hasAccess) {
      return NextResponse.json({ success: false, message: 'No permission to delete products' }, { status: 403 });
    }

    if (!existingProduct) {
      return NextResponse.json({ success: false, message: 'Product not found' }, { status: 404 });
    }

    // Delete product and related data in transaction
    await prisma.$transaction(async (tx) => {
      // Delete product images first
      await tx.productImage.deleteMany({
        where: { productId }
      });

      // Delete inventory records
      await tx.inventory.deleteMany({
        where: { productId }
      });

      // Delete the product
      await tx.product.delete({
        where: { id: productId }
      });
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Product deleted successfully' 
    });

  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to delete product' 
    }, { status: 500 });
  }
} 