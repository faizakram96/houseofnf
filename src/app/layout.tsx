import type { Metadata } from 'next';
import { Playfair_Display, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { CartProvider } from '@/context/CartContext';
import { WishlistProvider } from '@/context/WishlistContext';
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
  title: "House of NF | Luxury Royal Kurtas & Kurta Sets",
  description:
    'Discover timeless Indian elegance reimagined. Handcrafted Zardosi Chanderi Silk Kurta Sets & Lucknowi Chikankari Kurtas from House of NF.',
  keywords: ["Kurta Sets", "Kurtas", "Luxury Indian Ethnic Wear", "House of NF", "Chanderi Silk", "Chikankari"],
  openGraph: {
    title: "House of NF | Luxury Royal Kurtas & Kurta Sets",
    description: "Timeless Indian Elegance, Reimagined. Order direct on WhatsApp & Instagram.",
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
        <CartProvider>
          <WishlistProvider>
            <Navbar />
            <main>{children}</main>
            <CartDrawer />
            <Footer />
          </WishlistProvider>
        </CartProvider>
      </body>
    </html>
  );
}
