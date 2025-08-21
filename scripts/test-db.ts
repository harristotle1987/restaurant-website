// Ensure DIRECT_URL fallback is set before loading the Prisma client
if (!process.env.DIRECT_URL && process.env.DATABASE_URL) {
	process.env.DIRECT_URL = process.env.DATABASE_URL;
}

(async () => {
	// Import dynamically so env vars above are applied before Prisma parses the schema
	const { PrismaClient } = await import('@prisma/client');
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
			console.log('\nChecking existing tables...');

			const missingTables: string[] = [];

			try {
				const menuRecord = await prisma.menu.findFirst();
				console.log('✅ Menu table accessible (via model):', menuRecord ? 'Has records' : 'Empty table');
			} catch (e: any) {
				if (e?.code === 'P2021') {
					missingTables.push('menu');
					console.error('❌ Menu table does not exist:', e.message);
				} else {
					throw e;
				}
			}

			try {
				const bookingRecord = await prisma.booking.findFirst();
				console.log('✅ Bookings table accessible (via model):', bookingRecord ? 'Has records' : 'Empty table');
			} catch (e: any) {
				if (e?.code === 'P2021') {
					missingTables.push('bookings');
					console.error('❌ Bookings table does not exist:', e.message);
				} else {
					throw e;
				}
			}

			if (missingTables.length > 0) {
				console.error('\n❌ One or more expected tables are missing:', missingTables.join(', '));
				process.exitCode = 1;
				return;
			}
		} catch (error) {
			console.error('❌ Database test failed:', error);
			process.exitCode = 1;
		} finally {
			await prisma.$disconnect();
		}
	}

	await testDatabaseConnection();

	if (process.exitCode && process.exitCode !== 0) {
		console.error('\n❌ Test script completed with errors');
		process.exit(process.exitCode);
	} else {
		console.log('\n✅ All database tests completed successfully');
		process.exit(0);
	}
})();
