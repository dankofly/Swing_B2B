import { Suspense } from "react";
import { CartProvider } from "@/lib/cart";
import CartHeaderWrapper from "@/components/katalog/CartHeaderWrapper";
import ViewingAsClientBanner from "@/components/katalog/ViewingAsClientBanner";

export default function KatalogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CartProvider>
      <div className="min-h-screen bg-swing-gray-light">
        <Suspense>
          <CartHeaderWrapper />
          <ViewingAsClientBanner />
        </Suspense>
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 fade-in-up">{children}</main>
      </div>
    </CartProvider>
  );
}
