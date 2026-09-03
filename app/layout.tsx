import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Custom Employee Portal | Zoho One RBAC Integration',
  description: 'Enterprise Employee Portal with Role-Based Access Control and Zoho One API Integration',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-50 min-h-screen text-slate-900 antialiased">
        {children}
      </body>
    </html>
  );
}
