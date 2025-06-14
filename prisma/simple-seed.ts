import { PrismaClient } from '../app/generated/prisma'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting simplified seeding...')

  // Create sample user first
  const hashedPassword = await bcrypt.hash('admin123', 10)
  
  const user = await prisma.user.upsert({
    where: { email: 'admin@kopqela.com' },
    update: {},
    create: {
      firstName: 'Demo',
      lastName: 'Admin',
      email: 'admin@kopqela.com',
      phone: '+255123456789',
      passwordHash: hashedPassword,
      role: 'ADMIN',
      isActive: true,
      isVerified: true
    }
  })

  console.log('✅ User created:', user.email)

  // Create sample business with owner reference
  const business = await prisma.business.upsert({
    where: { slug: 'kopqela-demo' },
    update: {},
    create: {
      name: 'Kopqela Demo Store',
      description: 'Demo business for testing',
      businessType: 'retail',
      slug: 'kopqela-demo',
      address: 'Dar es Salaam, Tanzania',
      phone: '+255123456789',
      email: 'demo@kopqela.com',
      ownerId: user.id,
      currency: 'TZS',
      timezone: 'Africa/Dar_es_Salaam',
      language: 'sw',
      isActive: true,
      status: 'ACTIVE'
    }
  })

  console.log('✅ Business created:', business.name)

  // Update user to link with business
  await prisma.user.update({
    where: { id: user.id },
    data: { businessId: business.id }
  })

  console.log('✅ User linked to business')

  // Create sample categories
  const categories = [
    {
      name: 'Electronics',
      nameSwahili: 'Vifaa vya Umeme',
      description: 'Electronic devices and gadgets'
    },
    {
      name: 'Fashion',
      nameSwahili: 'Mavazi',
      description: 'Clothing, shoes and accessories'
    },
    {
      name: 'Food & Beverages',
      nameSwahili: 'Chakula na Vinywaji',
      description: 'Food items and drinks'
    },
    {
      name: 'Health & Beauty',
      nameSwahili: 'Afya na Urembo',
      description: 'Health products and cosmetics'
    },
    {
      name: 'Home & Garden',
      nameSwahili: 'Nyumbani na Bustani',
      description: 'Home appliances and garden tools'
    }
  ]

  for (const categoryData of categories) {
    // Check if category exists first
    const existingCategory = await prisma.category.findFirst({
      where: {
        businessId: business.id,
        name: categoryData.name
      }
    })

    if (!existingCategory) {
      const category = await prisma.category.create({
        data: {
          businessId: business.id,
          name: categoryData.name,
          nameSwahili: categoryData.nameSwahili,
          description: categoryData.description,
          isActive: true
        }
      })
      console.log(`✅ Category created: ${category.name}`)
    } else {
      console.log(`⏭️ Category already exists: ${existingCategory.name}`)
    }
  }

  // Create sample products
  const products = [
    {
      name: 'Samsung Galaxy Phone',
      nameSwahili: 'Simu ya Samsung Galaxy',
      description: 'Latest Samsung smartphone',
      price: 850000,
      categoryName: 'Electronics'
    },
    {
      name: 'Cotton T-Shirt',
      nameSwahili: 'Shati la Pamba',
      description: 'Comfortable cotton t-shirt',
      price: 25000,
      categoryName: 'Fashion'
    },
    {
      name: 'Cooking Oil',
      nameSwahili: 'Mafuta ya Kupikia',
      description: 'Pure cooking oil 1L',
      price: 3500,
      categoryName: 'Food & Beverages'
    }
  ]

  for (const productData of products) {
    const category = await prisma.category.findFirst({
      where: {
        businessId: business.id,
        name: productData.categoryName
      }
    })

    if (category) {
      const sku = `SKU-${productData.name.replace(/\s+/g, '-').toUpperCase()}`
      
      // Check if product exists first
      const existingProduct = await prisma.product.findFirst({
        where: {
          businessId: business.id,
          sku: sku
        }
      })

      if (!existingProduct) {
        const product = await prisma.product.create({
          data: {
            businessId: business.id,
            categoryId: category.id,
            name: productData.name,
            nameSwahili: productData.nameSwahili,
            description: productData.description,
            sku: sku,
            price: productData.price,
            unit: 'piece',
            isActive: true
          }
        })
        console.log(`✅ Product created: ${product.name}`)

        // Create inventory record
        const existingInventory = await prisma.inventory.findFirst({
          where: {
            businessId: business.id,
            productId: product.id
          }
        })

        if (!existingInventory) {
          await prisma.inventory.create({
            data: {
              businessId: business.id,
              productId: product.id,
              quantity: 100,
              reservedQuantity: 0,
              reorderPoint: 10,
              maxStock: 500,
              location: 'Main Store'
            }
          })
          console.log(`✅ Inventory created for: ${product.name}`)
        }
      } else {
        console.log(`⏭️ Product already exists: ${existingProduct.name}`)
      }
    }
  }

  console.log('🎉 Seeding completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 