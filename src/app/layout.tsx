import type { Metadata } from 'next';
import { Playfair_Display, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import AppProviders from '@/components/providers/AppProviders';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import CartDrawer from '@/components/cart/CartDrawer';

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: "House of NF | Curated Women's Fashion & Kurta Sets",
  description:
    'A thoughtfully curated fashion destination for the modern woman. Discover stylish, high-quality Kurta Sets and Kurtas from House of NF.',
  keywords: ["Kurta Sets", "Kurtas", "Women's Ethnic Wear", "Curated Fashion", "House of NF"],
  openGraph: {
    title: "House of NF | Curated Women's Fashion Destination",
    description: "A thoughtfully curated fashion destination for the modern woman. Shop on website & Instagram.",
    url: "https://houseofnf.com",
    siteName: "House of NF",
    images: [
      {
        url: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80",
        width: 1200,
        height: 630,
        alt: "House of NF Luxury Kurta Sets",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${playfair.variable} ${jakarta.variable}`}>
      <body className="font-sans antialiased text-stone-900 bg-[#FAF9F6]">
        <AppProviders>
          <Navbar />
          <main>{children}</main>
          <CartDrawer />
          <Footer />
        </AppProviders>
      </body>
    </html>
  );
}
