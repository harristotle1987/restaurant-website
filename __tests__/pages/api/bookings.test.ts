import { createMocks } from 'node-mocks-http';
import handler from '../../../pages/api/bookings';
import { prisma } from '../../../lib/prisma';

// Import jest types for TypeScript
import 'jest';

jest.mock('../../../lib/prisma', () => ({
  prisma: {
    booking: {
      create: jest.fn(),
    },
  },
}));

describe('/api/bookings', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 405 for non-POST requests', async () => {
    const { req, res } = createMocks({
      method: 'GET',
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(405);
    expect(JSON.parse(res._getData())).toEqual({ error: 'Method not allowed' });
  });

  it('validates required fields', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        name: '',
        email: '',
        date: '',
        time: '',
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(JSON.parse(res._getData())).toEqual({ error: 'Missing required fields' });
  });

  it('creates a booking successfully', async () => {
    const mockBooking = {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      date: new Date('2025-12-25'),
      time: '18:00',
      guests: 4,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    (prisma.booking.create as jest.Mock).mockResolvedValueOnce(mockBooking);

    const { req, res } = createMocks({
      method: 'POST',
      body: {
        name: 'John Doe',
        email: 'john@example.com',
        date: '2025-12-25',
        time: '18:00',
        guests: 4,
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(201);
    expect(JSON.parse(res._getData())).toMatchObject({
      success: true,
      message: 'Booking created successfully',
    });
  });
});
