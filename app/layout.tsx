import './globals.css';
import ServiceWorkerRegister from '@/app/components/ServiceWorkerRegister';
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900">
        <ServiceWorkerRegister />
        <div className="max-w-screen-xl mx-auto p-6">{children}</div>
      </body>
    </html>
  );
}
