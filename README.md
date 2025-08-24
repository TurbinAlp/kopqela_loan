# 🛍️ KOPPELA - Sales & Credit Management System

**KOPPELA** is a comprehensive business management platform that helps **businesses of all types** streamline their operations with inventory management, point-of-sale, customer management, and analytics - **PLUS a unique credit sales feature** that sets it apart from other business systems.

## 🔥 What KOPPELA Does

**KOPPELA IS NOT A LOAN COMPANY** - it's a **complete business management system** with standard features like POS, inventory, and customer management, PLUS an innovative **credit sales capability** that helps businesses increase revenue by offering payment plans to customers.

### Core Business Management Features:

🏪 **Point of Sale (POS) System**
- Fast product search and barcode scanning
- Real-time inventory tracking
- Multiple payment options: Cash, Card, Mobile Money
- Receipt generation and transaction logging

💳 **Credit Sales Management**
- Customers can purchase products on credit with installment plans

📊 **Inventory Management**
- Product catalog with categories and pricing (retail/wholesale)
- Stock level monitoring with low-stock alerts
- Automated inventory updates after sales
- Supplier and reorder point management
- Multi-location inventory tracking

👥 **Customer Management**
- Customer profiles with purchase history
- Contact information and preferences
- Purchase patterns and analytics
- Customer communication tools

📈 **Business Analytics & Reports**
- Sales reports and revenue tracking
- Inventory performance analytics
- Customer behavior insights
- Financial summaries and tax reports
- Daily/weekly/monthly business insights

### 🚀 **UNIQUE COMPETITIVE ADVANTAGE:**

💳 **Advanced Credit Sales Management** *(What makes KOPPELA special)*
- Customers can purchase products on credit with installment plans
- Automated credit application processing with verification
- Flexible payment terms (3, 6, 12, 24 months)
- Interest rate calculation and payment tracking
- Credit risk assessment and approval workflow
- Payment reminders and collection management
- Credit performance analytics

### User Roles:
- **Admin**: Full system access, business settings, user management
- **Manager**: Sales oversight, credit approvals, reports
- **Cashier**: POS operations, customer service, payment processing
- **Customer**: Online product browsing, order placement, account management

## 🚀 Technology Stack

- **Frontend**: Next.js 15 with React 19, Tailwind CSS, Framer Motion
- **Backend**: Next.js API Routes with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js with Google OAuth
- **Email**: Nodemailer for notifications
- **Deployment**: Vercel/Railway ready

## 🛠️ Getting Started

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- SMTP service for emails

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/your-username/koppela.git
cd koppela
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
Create a `.env.local` file:
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/koppela"

# NextAuth
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Email Configuration
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
EMAIL_FROM="your-email@gmail.com"
```

4. **Set up the database**
```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Seed the database (optional)
npx prisma db seed
```

5. **Start the development server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## 📁 Project Structure

```
├── app/                    # Next.js App Router
│   ├── admin/             # Admin dashboard pages
│   ├── api/               # API routes
│   ├── components/        # Reusable components
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Utility functions
│   ├── store/             # Customer-facing store
│   └── types/             # TypeScript type definitions
├── prisma/                # Database schema and migrations
├── public/                # Static assets
└── uploads/               # File upload storage
```

## 🔧 Key Features Implementation

### Standard Payment Options
- **Full Payment**: Immediate cash/card/mobile money payment
- **Partial Payment**: Pay percentage upfront, balance later
- **Wholesale Orders**: Bulk pricing for B2B customers

### Optional Credit Sales Workflow *(Competitive Advantage)*
1. Customer selects products in POS or online store
2. Chooses credit payment option with preferred term
3. Fills credit application (employment/business info)
4. System performs automated credit assessment
5. Admin reviews and approves/rejects application
6. Approved credit converts to active payment plan
7. System tracks payments and sends automated reminders

### Multi-language Support
- English and Kiswahili interface
- Localized business communications
- Cultural adaptation for Tanzanian market

## 🔒 Security Features

- Role-based access control (RBAC)
- JWT token authentication
- Password encryption with bcrypt
- SQL injection protection with Prisma
- Input validation with Zod schemas

## 📱 Responsive Design

- Mobile-first design approach
- Progressive Web App (PWA) capabilities
- Touch-friendly interface for tablets
- Print-optimized receipts and reports

## 🚀 Deployment

### Vercel Deployment
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Railway Deployment
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

## 📊 Business Model

KOPPELA serves **businesses of all types** that want to:
- **Streamline daily operations** with modern POS and inventory management
- **Grow customer relationships** with comprehensive customer management
- **Make data-driven decisions** with detailed analytics and reports
- **Increase revenue** by offering credit payment options to customers *(optional feature)*
- **Automate processes** to save time and reduce errors

**Target Businesses:**

🏪 **Retail & Wholesale:**
- Electronics stores
- Furniture retailers 
- Appliance dealers
- General merchandise stores
- Wholesale distributors
- Fashion & clothing boutiques

🍽️ **Food & Beverage:**
- Restaurants & cafes
- Grocery stores
- Food distributors
- Beverage suppliers

💊 **Healthcare & Pharmacy:**
- Pharmacies & drugstores
- Medical equipment suppliers
- Healthcare product distributors

🔧 **Services & Manufacturing:**
- Service providers
- Manufacturing companies
- Equipment suppliers
- Construction material suppliers

🌐 **Online & Digital:**
- E-commerce businesses
- Online marketplaces
- Digital service providers

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support and questions:
- Email: support@koppela.com
- Phone: +255 123 456 789
- Address: Dar es Salaam, Tanzania

---

**Built with ❤️ for Tanzanian businesses** 🇹🇿
