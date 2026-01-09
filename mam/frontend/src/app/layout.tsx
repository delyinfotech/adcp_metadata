import type { Metadata } from 'next';
import { Inter, Exo } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  weight: ['400', '500', '600', '700'],
});

const exo = Exo({
  subsets: ['latin'],
  variable: '--font-exo',
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'GEN21 MediaX AI',
  description: 'Intelligent Media Asset Management Platform',
  icons: {
    icon: '/gen21-logo.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${exo.variable} dark`}>
      <body className="bg-background-dark text-text-primary font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
