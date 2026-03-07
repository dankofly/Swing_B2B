import Header from "@/components/ui/Header";
import { CartProvider } from "@/lib/cart";
import CartHeaderWrapper from "@/components/katalog/CartHeaderWrapper";

export default function KatalogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CartProvider>
      <div className="min-h-screen bg-swing-gray-light">
        <CartHeaderWrapper />
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 fade-in-up">{children}</main>
      </div>
    </CartProvider>
  );
}
