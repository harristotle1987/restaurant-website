# Restaurant Website with Next.js & PostgreSQL

![Restaurant Website Screenshot](/public/images/screenshot.jpg)

A modern restaurant website featuring table reservations, special offers, and PostgreSQL database integration. Built with Next.js, TypeScript, and Tailwind CSS.

## ✨ Features
- **Online Reservations** - Customers can book tables with form validation
- **Special Offers** - Showcase weekly promotions with countdown timers
- **PostgreSQL Backend** - Store reservations and subscriptions securely
- **Responsive Design** - Mobile-friendly interface
- **Animations** - Smooth UI transitions with Framer Motion

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database
- Git

### Installation
1. Clone the repository:
```bash
git clone https://github.com/your-username/restaurant-website.git
cd restaurant-website
## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

CREATE TABLE bookings (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  date TIMESTAMPTZ NOT NULL,
  time VARCHAR(20) NOT NULL,
  guests INTEGER NOT NULL,
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE subscribers (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  subscribed_at TIMESTAMPTZ DEFAULT NOW(),
  active BOOLEAN DEFAULT TRUE
);

📚 Technologies
Next.js - React framework

TypeScript - Type safety

Tailwind CSS - Styling

PostgreSQL - Database

Framer Motion - Animations

React Hook Form - Form management

Zod - Schema validation

🤝 Contributing
Pull requests are welcome! For major changes, please open an issue first.

📄 License
MIT © [Your Name]

Made with ♥ by [Your Name] | Live Demo

text

This single-file README includes:
1. Project overview and features
2. Complete setup instructions
3. Database configuration
4. Project structure
5. Deployment options
6. Technology stack
7. Contribution guidelines
8. License information

To use:
1. Replace placeholders (`your-username`, `Your Name`, etc.)
2. Add your actual screenshot to `/public/images/screenshot.jpg`
3. Update the live demo link when deployed
4. Customize any sections as needed for your specific implementation
Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
