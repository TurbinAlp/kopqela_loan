// Simple database setup script for development
import { execSync } from 'child_process';

console.log('🚀 Setting up Kopqela database with Prisma...\n');

try {
  // Check if DATABASE_URL is set
  if (!process.env.DATABASE_URL) {
    console.log('⚠️  DATABASE_URL not found in environment');
    console.log('📝 Please create .env.local file with DATABASE_URL');
    console.log('💡 Example: DATABASE_URL="postgresql://kopqela_user:your_password@localhost:5432/kopqela_loan"\n');
    process.exit(1);
  }

  console.log('📊 Generating Prisma client...');
  execSync('npx prisma generate', { stdio: 'inherit' });

  console.log('\n🗄️  Pushing database schema...');
  execSync('npx prisma db push', { stdio: 'inherit' });

  console.log('\n✅ Database setup completed successfully!');
  console.log('\n📋 Next steps:');
  console.log('   1. Start the development server: npm run dev');
  console.log('   2. Test the registration API endpoints');
  console.log('   3. Check the API_SETUP.md file for usage examples\n');

} catch (error) {
  console.error('\n❌ Database setup failed:');
  console.error(error.message);
  console.log('\n🔧 Troubleshooting:');
  console.log('   1. Ensure PostgreSQL is running');
  console.log('   2. Check DATABASE_URL in .env.local');
  console.log('   3. Verify database user has proper permissions');
  console.log('   4. Check if the database exists\n');
  process.exit(1);
} 