import type { Metadata } from 'next';
import { Inter, Roboto, Playfair_Display, Lato, Oswald, Montserrat } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/context/AuthContext';
import './globals.css';
import InteractiveBackground from './components/InteractiveBackground';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const roboto = Roboto({ weight: ['400', '700'], subsets: ['latin'], variable: '--font-roboto' });
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' });
const lato = Lato({ weight: ['400', '700'], subsets: ['latin'], variable: '--font-lato' });
const oswald = Oswald({ subsets: ['latin'], variable: '--font-oswald' });
const montserrat = Montserrat({ subsets: ['latin'], variable: '--font-montserrat' });

export const metadata: Metadata = {
  title: 'Link Vault - Smart Link Hub Generator',
  description: 'Manage your links efficiently.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${roboto.variable} ${playfair.variable} ${lato.variable} ${oswald.variable} ${montserrat.variable} font-sans min-h-screen relative`}>
        <AuthProvider>
          <InteractiveBackground />
          {children}
          <Toaster position="bottom-right" toastOptions={{
            style: {
              background: '#333',
              color: '#fff',
            },
          }} />
        </AuthProvider>
      </body>
    </html>
  );
}
