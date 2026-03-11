import Header from "@/components/ui/Header";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-swing-gray-light">
      <Header isAdmin />
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 fade-in-up">{children}</main>
    </div>
  );
}
