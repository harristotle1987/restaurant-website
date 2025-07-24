import './globals.css';
import type { Metadata } from 'next';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';

export const metadata: Metadata = {
  title: 'Gourmet House | Fine Dining',
  description: 'Premium restaurant experience',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-amber-50">
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}