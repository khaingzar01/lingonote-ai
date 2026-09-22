import type { Metadata } from 'next';
import './globals.css';
import AuthGate from '@/components/AuthGate';

export const metadata: Metadata = {
  title: 'LingoNote AI',
  description: 'သင်ခန်းစာဓာတ်ပုံကို AI ဖြင့် Korean သင်ခန်းစာအဖြစ် ပြောင်းလဲပါ'
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="my">
      <body>
        <AuthGate>{children}</AuthGate>
      </body>
    </html>
  );
}
