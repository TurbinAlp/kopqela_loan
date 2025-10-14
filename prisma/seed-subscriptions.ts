import { PrismaClient } from '../app/generated/prisma'

const prisma = new PrismaClient()

async function seedSubscriptionPlans() {
  console.log('🌱 Seeding subscription plans...')

  const plans = [
    {
      name: 'BASIC',
      displayName: 'Basic Plan',
      displayNameSwahili: 'Mpango wa Msingi',
      description: 'Perfect for small businesses getting started',
      descriptionSwahili: 'Bora kwa biashara ndogo zinazoanza',
      priceMonthly: 20000, // TZS 20,000
      features: {
        max_businesses: 1,
        max_stores_per_business: 1,
        max_users_per_business: 2,
        enable_credit_sales: false,
        enable_advanced_reports: false,
        enable_accounting: false,
        enable_multi_store: false,
        enable_inventory_tracking: true,
        enable_pos: true,
        enable_basic_reports: true,
        enable_customer_management: true,
        enable_product_management: true,
        max_products: null, // unlimited
        max_customers: null, // unlimited
        max_orders_per_month: null, // unlimited
      },
    },
    {
      name: 'PROFESSIONAL',
      displayName: 'Professional Plan',
      displayNameSwahili: 'Mpango wa Kitaaluma',
      description: 'For growing businesses with multiple locations',
      descriptionSwahili: 'Kwa biashara zinazokua zenye maeneo mengi',
      priceMonthly: 40000, // TZS 40,000
      features: {
        max_businesses: 3,
        max_stores_per_business: 3,
        max_users_per_business: null, // unlimited
        enable_credit_sales: true,
        enable_advanced_reports: false,
        enable_accounting: false,
        enable_multi_store: true,
        enable_inventory_tracking: true,
        enable_pos: true,
        enable_basic_reports: true,
        enable_customer_management: true,
        enable_product_management: true,
        max_products: null, // unlimited
        max_customers: null, // unlimited
        max_orders_per_month: null, // unlimited
      },
    },
    {
      name: 'ENTERPRISE',
      displayName: 'Enterprise Plan',
      displayNameSwahili: 'Mpango wa Biashara Kubwa',
      description: 'Complete solution for large businesses',
      descriptionSwahili: 'Suluhisho kamili kwa biashara kubwa',
      priceMonthly: 75000, // TZS 75,000
      features: {
        max_businesses: null, // unlimited
        max_stores_per_business: null, // unlimited
        max_users_per_business: null, // unlimited
        enable_credit_sales: true,
        enable_advanced_reports: true,
        enable_accounting: true,
        enable_multi_store: true,
        enable_inventory_tracking: true,
        enable_pos: true,
        enable_basic_reports: true,
        enable_customer_management: true,
        enable_product_management: true,
        max_products: null, // unlimited
        max_customers: null, // unlimited
        max_orders_per_month: null, // unlimited
        priority_support: true,
        custom_integrations: true,
      },
    },
  ]

  for (const planData of plans) {
    const plan = await prisma.subscriptionPlan.upsert({
      where: { name: planData.name },
      update: planData,
      create: planData,
    })
    console.log(`✅ Created/Updated plan: ${plan.displayName} (${plan.name})`)
  }

  console.log('✅ Subscription plans seeded successfully!')
}

async function main() {
  try {
    await seedSubscriptionPlans()
  } catch (error) {
    console.error('Error seeding subscription plans:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })

