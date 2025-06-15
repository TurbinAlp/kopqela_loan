import { PrismaClient } from '../app/generated/prisma'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seeding...')

  // Create sample business
  const business = await prisma.business.upsert({
    where: { slug: 'kopqela-demo' },
    update: {},
    create: {
      name: 'Kopqela Demo Store',
      businessType: 'RETAIL',
      slug: 'kopqela-demo',
      isActive: true,
      businessSetting: {
        create: {
          description: 'Demo business for testing',
          address: 'Dar es Salaam, Tanzania',
          phone: '+255123456789',
          email: 'demo@kopqela.com',
          currency: 'TZS',
          timezone: 'Africa/Dar_es_Salaam',
          language: 'sw',
          city: 'Dar es Salaam',
          country: 'Tanzania',
          wholesaleMargin: 30,
          retailMargin: 50,
          taxRate: 18,
          enableTaxCalculation: true,
          enableInventoryTracking: true
        }
      }
    }
  })

  console.log('✅ Business created:', business.name)

  // Create sample admin user
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

  // Update business to set owner
  await prisma.business.update({
    where: { id: business.id },
    data: { ownerId: user.id }
  })

  console.log('✅ Admin user created:', user.email)

  // Create sample categories
  const categories = [
    {
      name: 'Electronics',
      nameSwahili: 'Vifaa vya Umeme',
      description: 'Electronic devices and accessories'
    },
    {
      name: 'Clothing',
      nameSwahili: 'Nguo',
      description: 'Fashion and apparel items'
    },
    {
      name: 'Food & Beverages',
      nameSwahili: 'Chakula na Vinywaji',
      description: 'Food items and drinks'
    },
    {
      name: 'Home & Garden',
      nameSwahili: 'Nyumbani na Bustani',
      description: 'Home improvement and garden supplies'
    },
    {
      name: 'Beauty & Personal Care',
      nameSwahili: 'Uzuri na Utunzaji wa Kibinafsi',
      description: 'Beauty products and personal care items'
    },
    {
      name: 'Sports & Outdoors',
      nameSwahili: 'Michezo na Nje',
      description: 'Sports equipment and outdoor gear'
    },
    {
      name: 'Books & Stationery',
      nameSwahili: 'Vitabu na Vifaa vya Ofisi',
      description: 'Books, notebooks, and office supplies'
    },
    {
      name: 'Health & Pharmacy',
      nameSwahili: 'Afya na Dawa',
      description: 'Health products and pharmaceutical items'
    }
  ]

  for (const categoryData of categories) {
    const category = await prisma.category.create({
      data: {
        businessId: business.id,
        name: categoryData.name,
        nameSwahili: categoryData.nameSwahili,
        description: categoryData.description,
        isActive: true
      }
    })

    console.log('✅ Category created:', category.name)
  }

  // Create sample products for some categories
  const electronicsCategory = await prisma.category.findFirst({
    where: { businessId: business.id, name: 'Electronics' }
  })

  const clothingCategory = await prisma.category.findFirst({
    where: { businessId: business.id, name: 'Clothing' }
  })

  if (electronicsCategory) {
    const products = [
      {
        name: 'Samsung Galaxy A54',
        nameSwahili: 'Samsung Galaxy A54',
        description: 'Latest Android smartphone with great camera',
        sku: 'SMG-A54-001',
        price: 850000,
        costPrice: 700000,
        categoryId: electronicsCategory.id
      },
      {
        name: 'iPhone 15',
        nameSwahili: 'iPhone 15',
        description: 'Latest iPhone with advanced features',
        sku: 'IPH-15-001',
        price: 1500000,
        costPrice: 1200000,
        categoryId: electronicsCategory.id
      }
    ]

    for (const productData of products) {
      const product = await prisma.product.upsert({
        where: {
          businessId_sku: {
            businessId: business.id,
            sku: productData.sku
          }
        },
        update: {},
        create: {
          ...productData,
          businessId: business.id,
          isActive: true
        }
      })

      console.log('✅ Product created:', product.name)

      // Create inventory for the product
      await prisma.inventory.upsert({
        where: {
          businessId_productId: {
            businessId: business.id,
            productId: product.id
          }
        },
        update: {},
        create: {
          businessId: business.id,
          productId: product.id,
          location: 'main-store',
          quantity: Math.floor(Math.random() * 50) + 10,
          reservedQuantity: 0,
          reorderPoint: 5,
          maxStock: 100
        }
      })
    }
  }

  if (clothingCategory) {
    const product = await prisma.product.upsert({
      where: {
        businessId_sku: {
          businessId: business.id,
          sku: 'CTT-001'
        }
      },
      update: {},
      create: {
        businessId: business.id,
        name: 'Cotton T-Shirt',
        nameSwahili: 'Shati la Pamba',
        description: 'Comfortable cotton t-shirt',
        sku: 'CTT-001',
        price: 25000,
        costPrice: 15000,
        categoryId: clothingCategory.id,
        isActive: true
      }
    })

    console.log('✅ Product created:', product.name)

    // Create inventory
    await prisma.inventory.upsert({
      where: {
        businessId_productId: {
          businessId: business.id,
          productId: product.id
        }
      },
      update: {},
      create: {
        businessId: business.id,
        productId: product.id,
        location: 'main-store',
        quantity: 8,
        reservedQuantity: 0,
        reorderPoint: 5,
        maxStock: 50
      }
    })
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