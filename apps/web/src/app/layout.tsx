import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'EDEN — Living World Observatory',
  description: 'Observe an autonomous digital ecosystem as it thinks, adapts, and remembers.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="overflow-hidden bg-[#07100e]">{children}</body>
    </html>
  );
}
