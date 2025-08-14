# Koppela Sales & Credit Management System Database Schema

## Overview
Hii ni comprehensive PostgreSQL database schema kwa Sales & Credit Management System inayosupport multi-store business model pamoja na advanced credit management features.

## Features za Database Schema

### 1. **Authentication & User Management**
- **Dual Authentication**: Google OAuth + Email/Password
- **Role-based Access Control**: Admin, Manager, Cashier, Customer
- **Session Management**: JWT tokens na device tracking
- **Security Features**: Account lockout, password reset, email verification

### 2. **Multi-Store Business Management**
- **Multi-tenant Architecture**: Kila business ina isolated data
- **Business Approval Workflow**: Pending → Approved → Active
- **Customizable Business Settings**: Colors, taxes, prefixes, credit policies
- **User Roles per Business**: Flexible permission system

### 3. **Product & Inventory Management**
- **Hierarchical Categories**: Parent-child category relationships
- **Multilingual Support**: English + Swahili product names
- **Comprehensive Product Data**: SKU, barcode, pricing, specifications
- **Real-time Inventory Tracking**: Available, reserved, on-order quantities
- **Automated Stock Movements**: Triggers for automatic inventory updates

### 4. **Customer Management**
- **Individual & Business Customers**: Separate customer types
- **Credit Assessment Data**: Employment, income, guarantor information
- **Credit Scoring**: Built-in credit scoring system
- **Customer Preferences**: Payment methods, notes

### 5. **Advanced Credit Management**
- **Credit Applications**: Full application workflow
- **Risk Assessment**: Automated scoring and manual review
- **Flexible Payment Terms**: Daily, weekly, monthly installments
- **Credit Monitoring**: Overdue tracking, late fees
- **Guarantor System**: Multiple guarantors per customer

### 6. **Order & Sales Management**
- **Complete Order Lifecycle**: Pending → Delivered
- **Multiple Payment Methods**: Cash, Card, Mobile Money, Credit
- **Partial Payments**: Split payment support
- **Delivery Options**: Pickup or delivery
- **Order Snapshots**: Product details at time of purchase

### 7. **Payment & Financial Management**
- **Payment Tracking**: Full payment history
- **Payment Schedules**: Installment planning
- **Gateway Integration**: Support for payment providers
- **Financial Reporting**: Daily sales summaries

### 8. **Notification System**
- **Multi-channel Notifications**: In-app, Email, SMS
- **Event-based Triggers**: Order updates, payment reminders
- **Template System**: Reusable message templates
- **Delivery Tracking**: Success/failure logging

### 9. **File Management**
- **Secure File Storage**: Product images, documents, receipts
- **Metadata Support**: Tags, descriptions, file categorization
- **Access Control**: Public/private file permissions

### 10. **Analytics & Reporting**
- **Performance Optimization**: Pre-calculated summaries
- **Audit Trail**: Complete system activity logging
- **Business Intelligence**: Summary views and reports

## Database Setup Instructions

### Prerequisites
```bash
# Install PostgreSQL 14+
sudo apt update
sudo apt install postgresql postgresql-contrib

# Access PostgreSQL
sudo -u postgres psql
```

### 1. Create Database and User
```sql
-- Create database
CREATE DATABASE koppela_db;

-- Create user with password
CREATE USER koppela_user WITH PASSWORD 'your_strong_password';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE koppela_db TO koppela_user;
GRANT ALL ON SCHEMA public TO koppela_user;
```

### 2. Run Schema Creation
```bash
# Connect to database and run schema
psql -U koppela_user -d koppela_db -f database_schema.sql

# Alternative: if you have issues with extensions, run as superuser first
sudo -u postgres psql -d koppela_db -c "CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";"
sudo -u postgres psql -d koppela_db -c "CREATE EXTENSION IF NOT EXISTS pgcrypto;"
```

### 3. Verify Installation
```sql
-- Check tables were created
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';

-- Check default admin user was created
SELECT id, email, full_name FROM users WHERE email = 'admin@koppela.com';

-- Check views were created
SELECT viewname FROM pg_views WHERE schemaname = 'public';
```

## Environment Configuration

### Environment Variables (.env)
```env
# Database Configuration
DATABASE_URL=postgresql://koppela_user:your_password@localhost:5432/koppela_db
DB_HOST=localhost
DB_PORT=5432
DB_NAME=koppela_db
DB_USER=koppela_user
DB_PASSWORD=your_strong_password

# Security
JWT_SECRET=your_jwt_secret_key_here
BCRYPT_ROUNDS=12

# Google OAuth (if using)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Email Configuration (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password

# SMS Configuration (optional)
SMS_PROVIDER=twilio
SMS_API_KEY=your_sms_api_key
```

## Common Queries

### Business Operations
```sql
-- Get business summary
SELECT * FROM business_summary WHERE slug = 'your-business-slug';

-- Get all business users and their roles
SELECT u.full_name, bu.role, bu.is_active 
FROM business_users bu
JOIN users u ON bu.user_id = u.id
WHERE bu.business_id = 'your-business-id';

-- Get low stock products
SELECT * FROM product_inventory_view 
WHERE business_id = 'your-business-id' 
AND stock_status IN ('low_stock', 'out_of_stock');
```

### Customer & Credit Management
```sql
-- Get customer credit summary
SELECT * FROM customer_credit_summary 
WHERE business_id = 'your-business-id' 
AND total_outstanding > 0;

-- Get overdue credit accounts
SELECT cs.*, c.first_name, c.last_name
FROM credit_sales cs
JOIN customers c ON cs.customer_id = c.id
WHERE cs.business_id = 'your-business-id'
AND cs.status = 'active'
AND cs.due_date < CURRENT_DATE;

-- Get pending credit applications
SELECT ca.*, c.first_name, c.last_name
FROM credit_applications ca
JOIN customers c ON ca.customer_id = c.id
WHERE ca.business_id = 'your-business-id'
AND ca.status = 'pending';
```

### Sales & Orders
```sql
-- Daily sales report
SELECT 
    DATE(order_date) as date,
    COUNT(*) as total_orders,
    SUM(total_amount) as total_revenue,
    AVG(total_amount) as average_order_value
FROM orders 
WHERE business_id = 'your-business-id' 
AND status = 'delivered'
AND order_date >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE(order_date)
ORDER BY date DESC;

-- Top selling products
SELECT 
    p.name,
    SUM(oi.quantity) as total_sold,
    SUM(oi.total_price) as total_revenue
FROM order_items oi
JOIN products p ON oi.product_id = p.id
JOIN orders o ON oi.order_id = o.id
WHERE o.business_id = 'your-business-id'
AND o.status = 'delivered'
AND o.order_date >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY p.id, p.name
ORDER BY total_sold DESC
LIMIT 10;
```

## Performance Optimization

### Recommended Indexes (already included)
- All foreign keys have indexes
- Search fields (email, phone, SKU) have indexes
- Date fields for reporting have indexes
- Full-text search on product names

### Database Tuning (PostgreSQL)
```sql
-- For better performance, consider these settings:
ALTER SYSTEM SET shared_buffers = '256MB';
ALTER SYSTEM SET effective_cache_size = '1GB';
ALTER SYSTEM SET maintenance_work_mem = '64MB';
ALTER SYSTEM SET checkpoint_completion_target = 0.9;
ALTER SYSTEM SET wal_buffers = '16MB';

-- Reload configuration
SELECT pg_reload_conf();
```

### Backup Strategy
```bash
# Daily backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump -U koppela_user -h localhost koppela_db > backup_koppela_$DATE.sql

# Keep only last 7 days of backups
find /path/to/backups -name "backup_koppela_*.sql" -mtime +7 -delete
```

## Data Migration

### Sample Data Insertion
```sql
-- Insert sample business
INSERT INTO businesses (name, slug, business_type, owner_id, status) VALUES
('Duka la Mama', 'duka-la-mama', 'retail', 
 (SELECT id FROM users WHERE email = 'admin@koppela.com'), 'active');

-- Insert sample products
INSERT INTO products (business_id, name, name_sw, retail_price, status, created_by) VALUES
((SELECT id FROM businesses WHERE slug = 'duka-la-mama'), 
 'Rice 5kg', 'Mchele Kilo 5', 12000.00, 'active',
 (SELECT id FROM users WHERE email = 'admin@koppela.com'));

-- Initialize inventory
INSERT INTO inventory (product_id, quantity_available, reorder_point) VALUES
((SELECT id FROM products WHERE name = 'Rice 5kg'), 100, 10);
```

## Security Considerations

1. **Use strong passwords** for database users
2. **Enable SSL** for database connections in production
3. **Regular backups** with encryption
4. **Monitor audit logs** for suspicious activity
5. **Implement rate limiting** at application level
6. **Validate all inputs** to prevent SQL injection
7. **Use prepared statements** in application code

## Troubleshooting

### Common Issues
```bash
# Permission denied
sudo chown postgres:postgres /var/lib/postgresql/data

# Extension not found
sudo apt install postgresql-contrib

# Connection refused
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Check PostgreSQL status
sudo systemctl status postgresql
```

### Useful Commands
```sql
-- Check database size
SELECT pg_size_pretty(pg_database_size('koppela_db'));

-- Check table sizes
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(tablename::text)) as size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(tablename::text) DESC;

-- Active connections
SELECT * FROM pg_stat_activity WHERE datname = 'koppela_db';
```

## Support

Kama una maswali au issues:
1. Check logs: `/var/log/postgresql/`
2. Verify schema version matches your application
3. Ensure all required extensions are installed
4. Check user permissions and database grants

## Version Information
- **PostgreSQL Version**: 14+ (recommended)
- **Schema Version**: 1.0.0
- **Created**: 2024
- **Extensions Required**: uuid-ossp, pgcrypto 