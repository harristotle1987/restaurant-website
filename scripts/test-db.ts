import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testDatabaseConnection() {
  try {
    // Test connection
    console.log('Testing database connection...');
    await prisma.$connect();
    console.log('✅ Successfully connected to the database');

    // Test query
    console.log('\nTesting simple query...');
    const result = await prisma.$queryRaw`SELECT current_timestamp;`;
    console.log('✅ Query successful:', result);

    // Test table access (if they exist)
    try {
      console.log('\nChecking existing tables...');
      const menu = await prisma.menu.findFirst();
      console.log('✅ Menu table accessible:', menu ? 'Has records' : 'Empty table');
    } catch (e) {
      console.log('ℹ️ Menu table not yet created');
    }

    try {
      const bookings = await prisma.booking.findFirst();
      console.log('✅ Bookings table accessible:', bookings ? 'Has records' : 'Empty table');
    } catch (e) {
      console.log('ℹ️ Bookings table not yet created');
    }

  } catch (error) {
    console.error('❌ Database test failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testDatabaseConnection()
  .then(() => {
    console.log('\n✅ All database tests completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Test script failed:', error);
    process.exit(1);
  });
