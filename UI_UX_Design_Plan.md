# UI/UX Design Plan - Sales and Credit Management System

## Table of Contents
1. [Design System & Principles](#design-system--principles)
2. [User Flow Architecture](#user-flow-architecture)
3. [Page Structure & Components](#page-structure--components)
4. [Component Library](#component-library)
5. [Responsive Design Strategy](#responsive-design-strategy)
6. [Multilingual Implementation](#multilingual-implementation)
7. [Implementation Roadmap](#implementation-roadmap)

---

## Design System & Principles

### Design Philosophy
- **Clean & Modern**: Minimal interface with clear typography
- **Mobile-First**: Responsive design for all devices
- **Multilingual Ready**: Support for Swahili and English
- **Role-Based**: Distinct experiences for each user type
- **Data-Driven**: Clear visualization of sales, debts, and inventory

### Color Palette
```css
:root {
  /* Primary Colors - sasa ni TEAL */
    --primary-color: #059669;           
    --primary-color-light: #10B981;     
    --primary-color-dark: #047857;     

    /* Secondary Colors - sasa ni BLUE */
    --secondary-color: #2563EB;         
    --secondary-color-light: #3B82F6;  
    --secondary-color-dark: #1E40AF;   

  
  
  /* Status Colors */
  --warning-orange: #EA580C;
  --danger-red: #DC2626;
  --info-blue: #0284C7;
  
  /* Neutral Colors */
  --gray-50: #F8FAFC;
  --gray-100: #F1F5F9;
  --gray-200: #E2E8F0;
  --gray-300: #CBD5E1;
  --gray-400: #94A3B8;
  --gray-500: #64748B;
  --gray-600: #475569;
  --gray-700: #334155;
  --gray-800: #1E293B;
  --gray-900: #0F172A;
}
```

### Typography
- **Primary Font**: Inter (web-safe, multilingual support)
- **Font Sizes**:
  - H1: 2.5rem (40px)
  - H2: 2rem (32px)
  - H3: 1.5rem (24px)
  - H4: 1.25rem (20px)
  - Body: 1rem (16px)
  - Small: 0.875rem (14px)

### Spacing System
```css
/* Spacing Scale (rem units) */
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-5: 1.25rem;   /* 20px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
```

---

## User Flow Architecture

### Authentication Flow
```
Landing Page 
    ↓
Login/Register Page
    ↓
Role Detection
    ↓
Dashboard Redirect
    ├── Admin Dashboard
    ├── Cashier Dashboard
    └── Customer Portal
```

### Admin User Flow
```
Admin Dashboard
    ├── Products Management
    │   ├── View All Products
    │   ├── Add New Product
    │   ├── Edit Product
    │   └── Manage Inventory
    ├── Sales Management
    │   ├── View All Orders
    │   ├── Process Payments
    │   └── Generate Reports
    ├── Customer Management
    │   ├── View Customers
    │   ├── Customer Details
    │   └── Credit History
    ├── Loan Management
    │   ├── Pending Applications
    │   ├── Approve/Reject
    │   └── Repayment Tracking
    └── System Settings
        ├── User Management
        ├── Language Settings
        └── Business Configuration
```

### Cashier User Flow
```
Cashier Dashboard
    ├── New Sale
    │   ├── Product Search
    │   ├── Add to Cart
    │   ├── Customer Selection
    │   ├── Payment Method
    │   └── Process Sale
    ├── Customer Lookup
    │   ├── Search Customer
    │   ├── View Order History
    │   └── Outstanding Balances
    └── Pending Payments
        ├── Collect Payment
        ├── Update Balance
        └── Generate Receipt
```

### Customer User Flow
```
Customer Portal
    ├── Browse Products
    │   ├── Category Filter
    │   ├── Search Products
    │   └── Product Details
    ├── Request Purchase
    │   ├── Select Quantity
    │   ├── Choose Payment Method
    │   │   ├── Full Payment
    │   │   ├── Partial Payment
    │   │   └── Credit Application
    │   └── Order Confirmation
    └── My Account
        ├── Order History
        ├── Payment History
        ├── Outstanding Balances
        └── Profile Settings
```

---

## Page Structure & Components

### 1. Authentication Pages

#### Login Page
**Layout Components:**
- Logo and business name
- Language toggle (EN/SW)
- **Google Sign-In Button**
  - Google logo + "Continue with Google" / "Endelea na Google"
  - Full-width button with Google brand colors
  - Primary authentication method
- **Email Divider**
  - "Or continue with email" / "Au endelea na email"
  - Horizontal line with text in center
- **Email Login Form**
  - Email input field
  - Password input field
  - "Show/Hide password" toggle
  - Remember me checkbox
  - Login button
- **Additional Links**
  - Forgot password link/forgot email
  - Register link ("Don't have an account? Sign up" / "Huna akaunti? Jisajili")


#### Registration Page
**Multi-step Form with Social Options:**

**Step 1: Registration Method Selection**
- **Google Sign-Up Button**
  - "Sign up with Google" / "Jisajili kwa Google"
- **Email Divider**
  - "Or sign up with email" / "Au jisajili kwa email"
- **Email Registration Form**
  - Full name input
  - Email address input
  - Password input with strength indicator
  - Confirm password input
  - Phone number input (optional)
  - Terms and conditions checkbox
  - "Create Account" button

**Step 2: Role Selection & Profile**
- **Role Selection Cards**
  - Customer Card (default selected)
    - Icon: Shopping bag
    - Title: "Customer" / "Mteja"
    - Description: "Browse and purchase products" / "Angalia na nunua bidhaa"
  - Business Request Card
    - Icon: Building/Store
    - Title: "Business User" / "Mtumiaji wa Biashara"
    - Description: "Request cashier/admin access" / "Omba ufikiaji wa muhudumu/msimamizi"
- **Additional Info (if Business selected)**
  - Business name
  - Business type dropdown
  - Business registration number (optional)
  - Reason for business access textarea

**Step 3: Verification**
- **Email Verification**
  - Verification code input (6 digits)
  - "Resend code" button
  - Timer countdown (60 seconds)
- **Phone Verification (optional)**
  - SMS verification code
  - Skip option available

#### Forgot Password Page
**Layout Components:**
- Back to login arrow
- Logo and title
- **Password Reset Form**
  - Email input field
  - "Send Reset Link" button
- **Alternative Options**
  - "Remember your password? Sign in" link
  - Contact support link

#### Password Reset Page
**Layout Components:**
- Logo and title
- **New Password Form**
  - New password input with strength indicator
  - Confirm new password input
  - "Reset Password" button
- Success state with redirect to login

#### Social Authentication Flow
**Google OAuth Integration:**
```jsx
// Google Sign-In Component
<GoogleSignInButton
  onSuccess={handleGoogleSuccess}
  onError={handleGoogleError}
  text="signin_with" // or "signup_with"
  locale={currentLanguage} // 'en' or 'sw'
  width="100%"
  height="48px"
/>
```

**Implementation Notes:**
- Use Google Identity Services (GIS) library
- Handle both login and registration flows
- Auto-fill user data from Google profile
- Graceful fallback to email if Google fails

#### Responsive Design for Auth Pages

**Mobile (320px - 768px):**
- Single column layout
- Full-width form elements
- Google button remains prominent
- Simplified navigation
- Touch-friendly button sizes (min 48px)

**Tablet (768px - 1024px):**
- Centered form with more padding
- Side-by-side layout for some form elements
- Maintain button hierarchy

**Desktop (1024px+):**
- Centered card layout (max-width: 400px)
- Background image or gradient
- More generous spacing
- Hover effects on interactive elements

#### Security & UX Considerations

**Password Requirements:**
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- Special character recommended
- Real-time validation feedback

**Error Handling:**
- Clear error messages for each field
- Network error handling
- Google OAuth error states
- Account already exists flow
- Invalid credentials messaging

**Loading States:**
- Button loading spinners
- Google sign-in loading state
- Form submission feedback
- Verification code sending state

#### Accessibility Features
- ARIA labels for all form elements
- Keyboard navigation support
- Screen reader friendly error messages
- High contrast mode support
- Focus indicators on all interactive elements

### 2. Admin Dashboard

#### Main Dashboard Layout
**Header Navigation:**
- Logo/Business name
- Language toggle
- Notifications icon
- User profile dropdown
  - Profile settings
  - Change password
  - Logout

**Sidebar Navigation:**
- Dashboard overview
- Products
  - All products
  - Add product
  - Categories
  - Low stock
- Sales & Orders
  - All orders
  - Pending payments
  - Cash sales
  - Credit sales
- Customers
  - All customers
  - Add customer
  - Customer groups
- Loans
  - Applications
  - Active loans
  - Overdue loans
  - Loan settings
- Reports
  - Sales reports
  - Debt reports
  - Inventory reports
  - Custom reports
- Settings
  - User management
  - Business settings
  - Language settings

#### Dashboard Widgets
**Row 1: Summary Cards**
- Total Sales (Today)
- Pending Loans
- Low Stock Items
- Outstanding Debt

**Row 2: Charts**
- Sales trend (line chart)
- Payment methods (pie chart)

**Row 3: Recent Activity**
- Recent orders table
- Pending loan applications
- System notifications

#### Products Management
**Product Grid View:**
- Product card components
  - Product image
  - Product name
  - Category badge
  - Price (wholesale/retail)
  - Stock quantity
  - Action buttons (view, edit, delete)

**Product List View:**
- Sortable table
- Columns: Image, Name, Category, Price, Stock, Status, Actions
- Bulk actions toolbar

**Add/Edit Product Form:**
- Product information
  - Name (EN/SW)
  - Description (EN/SW)
  - Category selection
  - Product type (wholesale/retail)
- Pricing
  - Wholesale price
  - Retail price
  - Cost price
- Inventory
  - Current stock
  - Minimum stock level
  - Stock alerts
- Images
  - Multiple image upload
  - Image preview
  - Primary image selection

### 3. Cashier Dashboard

#### Point of Sale Interface
**Layout Sections:**
- **Left Panel: Product Search & Cart**
  - Search bar
  - Category quick filters
  - Shopping cart
    - Item list
    - Quantities
    - Remove items
    - Total calculation
- **Right Panel: Customer & Payment**
  - Customer search/selection
  - Payment method selection
  - Payment processing
  - Receipt preview

**Product Search:**
- Search by name/barcode
- Category filters
- Product grid with quick add buttons

**Payment Methods:**
- **Cash Payment**
  - Amount tendered
  - Change calculation
- **Partial Payment**
  - Amount paid input
  - Due date picker
  - Remaining balance display
- **Credit/Loan**
  - Loan application form
  - Guarantor information
  - Loan terms selection

### 4. Customer Portal

#### Homepage
**Hero Section:**
- Business branding
- Welcome message
- Featured products carousel
- Call-to-action buttons

**Navigation:**
- Logo
- Product categories
- Search bar
- Language toggle
- User account menu

**Content Sections:**
- Featured products
- New arrivals
- Categories grid
- About business

#### Product Catalog
**Filter Sidebar:**
- Categories
- Price range
- Product type
- Availability

**Product Grid:**
- Product cards
  - Image
  - Name
  - Price
  - Stock status
  - Quick view button

**Product Details Page:**
- Image gallery
- Product information
- Price display
- Stock availability
- Request purchase button
- Related products

#### Order Request Flow
**Step 1: Product Confirmation**
- Product details review
- Quantity selection
- Total calculation

**Step 2: Payment Method Selection**
- Full payment option
- Partial payment option
  - Amount input
  - Due date selection
- Credit application option

**Step 3: Credit Application (if selected)**
- Personal information
- Employment details
- Guarantor information
- Loan duration
- Terms acceptance

**Step 4: Order Summary**
- Order details
- Payment terms
- Submit button

---

## Implementation Roadmap

### Phase 1: Foundation (Weeks 1-2)
**Goals**: Set up design system and authentication

#### Week 1: Design System Setup
- [ ] Create design tokens (colors, typography, spacing)
- [ ] Set up component library structure
- [ ] Create base components (Button, Input, Card)
- [ ] Set up responsive breakpoints
- [ ] Create layout components

#### Week 2: Authentication
- [ ] Design login/register pages
- [ ] Implement authentication forms
- [ ] Create user role detection
- [ ] Set up protected routes
- [ ] Design forgot password flow

**Deliverables:**
- Component library documentation
- Authentication pages
- Basic routing structure

### Phase 2: Admin Interface (Weeks 3-4)
**Goals**: Complete admin dashboard and core functionality

#### Week 3: Admin Dashboard
- [ ] Create dashboard layout with sidebar
- [ ] Implement summary widgets
- [ ] Create charts and data visualization
- [ ] Design notification system
- [ ] Implement responsive navigation

#### Week 4: Product Management
- [ ] Design product listing page
- [ ] Create add/edit product forms
- [ ] Implement product image upload
- [ ] Create inventory management interface
- [ ] Design category management

**Deliverables:**
- Admin dashboard
- Product management system
- Inventory tracking interface

### Phase 3: Sales Processing (Weeks 5-6)
**Goals**: Complete cashier interface and sales processing

#### Week 5: Cashier Interface
- [ ] Design POS interface
- [ ] Create product search functionality
- [ ] Implement shopping cart
- [ ] Design customer selection
- [ ] Create payment method selection

#### Week 6: Payment Processing
- [ ] Implement cash payment flow
- [ ] Create partial payment interface
- [ ] Design credit application form
- [ ] Create receipt generation
- [ ] Implement payment tracking

**Deliverables:**
- Cashier POS system
- Payment processing workflows
- Receipt generation system

### Phase 4: Customer Portal (Weeks 7-8)
**Goals**: Complete customer-facing interface

#### Week 7: Product Catalog
- [ ] Design customer homepage
- [ ] Create product catalog with filtering
- [ ] Implement product search
- [ ] Design product detail pages
- [ ] Create category navigation

#### Week 8: Order Management
- [ ] Create order request flow
- [ ] Implement payment method selection
- [ ] Design credit application for customers
- [ ] Create customer account pages
- [ ] Implement order history

**Deliverables:**
- Customer portal
- Product catalog
- Order management system

### Phase 5: Advanced Features (Weeks 9-10)
**Goals**: Complete loan management and reporting

#### Week 9: Loan Management
- [ ] Design loan application interface
- [ ] Create approval workflow
- [ ] Implement repayment tracking
- [ ] Design loan history views
- [ ] Create overdue payment alerts

#### Week 10: Reports & Analytics
- [ ] Design reporting dashboard
- [ ] Create sales reports
- [ ] Implement debt tracking reports
- [ ] Design inventory reports
- [ ] Create export functionality

**Deliverables:**
- Loan management system
- Reporting dashboard
- Analytics interface

### Phase 6: Polish & Optimization (Weeks 11-12)
**Goals**: Finalize multilingual support and optimize performance

#### Week 11: Multilingual Implementation
- [ ] Implement translation system
- [ ] Create language switching
- [ ] Translate all interface text
- [ ] Test Swahili language support
- [ ] Implement locale-specific formatting

#### Week 12: Testing & Optimization
- [ ] Performance optimization
- [ ] Mobile responsiveness testing
- [ ] User experience testing
- [ ] Accessibility improvements
- [ ] Final bug fixes and polish

**Deliverables:**
- Fully multilingual interface
- Performance-optimized application
- Comprehensive testing results

---

## Success Metrics & KPIs

### User Experience Metrics
- **Page Load Time**: < 3 seconds
- **Mobile Responsiveness**: 100% compatible
- **Accessibility Score**: WCAG 2.1 AA compliance
- **User Task Completion Rate**: > 95%

### Technical Metrics
- **Component Reusability**: > 80%
- **Code Coverage**: > 90%
- **Performance Score**: > 90 (Lighthouse)
- **Cross-browser Compatibility**: Chrome, Firefox, Safari, Edge

### Business Metrics
- **User Adoption Rate**: Track by role
- **Feature Usage**: Most/least used features
- **Error Rate**: < 1% for critical flows
- **Support Tickets**: Reduction in UI/UX related issues

---

## Appendix

### A. Design Assets Needed
- [ ] Business logo (various sizes)
- [ ] Product placeholder images
- [ ] Icons for categories
- [ ] User avatar placeholders
- [ ] Loading animations
- [ ] Empty state illustrations

### B. Third-party Integrations
- [ ] Chart.js or similar for data visualization
- [ ] Date picker library
- [ ] File upload component
- [ ] PDF generation for receipts
- [ ] Print functionality

### C. Browser Support
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers (iOS Safari, Chrome Mobile)

### D. Performance Targets
- First Contentful Paint: < 1.5s
- Largest Contentful Paint: < 2.5s
- Cumulative Layout Shift: < 0.1
- First Input Delay: < 100ms

---

*This document will be updated as the project progresses and requirements evolve.* 