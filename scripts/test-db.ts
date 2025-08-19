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

      // Use Prisma model methods directly now that client is generated from schema
      const menuRecord = await prisma.menu.findFirst();
      console.log('✅ Menu table accessible (via model):', menuRecord ? 'Has records' : 'Empty table');

      const bookingRecord = await prisma.booking.findFirst();
      console.log('✅ Bookings table accessible (via model):', bookingRecord ? 'Has records' : 'Empty table');
    } catch (e) {
      console.log('ℹ️ Menu or bookings table may not be created yet:', e);
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
