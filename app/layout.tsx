import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AirIQ Nairobi — Air Quality Intelligence',
  description: 'Real-time air quality monitoring, exposure studies, and health recommendations across all 17 subcounties of Nairobi.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
