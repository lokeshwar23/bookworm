import "@/app/globals.css";
import { AuthProvider } from "@/components/forms/AuthProvider";
import { CartProvider } from "@/components/forms/CartProvider";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export const metadata = {
  title: "BookWorm",
  description: "Your online bookstore — browse, discover and buy books.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full" data-scroll-behavior="smooth">
      <body className="min-h-full flex flex-col bg-[#0f0f0f] text-gray-200 antialiased">
        <AuthProvider>
          <CartProvider>
            <div className="flex flex-col min-h-screen">
              <Navbar />
              <main className="flex-1">
                {children}
              </main>
              <Footer />
            </div>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
