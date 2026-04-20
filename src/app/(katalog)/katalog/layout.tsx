import { Suspense } from "react";
import { CartProvider } from "@/lib/cart";
import CartHeaderWrapper from "@/components/katalog/CartHeaderWrapper";
import ViewingAsClientBanner from "@/components/katalog/ViewingAsClientBanner";
import NewsTickerWrapper from "@/components/katalog/NewsTickerWrapper";

export default function KatalogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CartProvider>
      <div className="min-h-screen bg-swing-gray-light">
        <Suspense fallback={<div className="h-16 bg-swing-navy" />}>
          <CartHeaderWrapper />
          <ViewingAsClientBanner />
        </Suspense>
        <Suspense fallback={null}>
          <NewsTickerWrapper />
        </Suspense>
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 fade-in-up">{children}</main>
      </div>
    </CartProvider>
  );
}
