"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ShoppingCart, LogOut, User, Settings, Menu, X } from "lucide-react";
import { useState } from "react";

interface HeaderProps {
  isAdmin?: boolean;
  showAdminLink?: boolean;
  userName?: string;
  cartCount?: number;
}

const adminLinks = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/produkte", label: "Produkte" },
  { href: "/admin/kunden", label: "Kunden" },
  { href: "/admin/lager", label: "Lagerbestand" },
  { href: "/admin/anfragen", label: "Anfragen" },
];

const katalogLinks = [
  { href: "/katalog", label: "Katalog" },
  { href: "/katalog/dashboard", label: "Dashboard" },
  { href: "/katalog/anfragen", label: "Anfragen" },
  { href: "/katalog/profil", label: "Profil" },
];

export default function Header({
  isAdmin = false,
  showAdminLink = false,
  userName,
  cartCount = 0,
}: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const links = isAdmin ? adminLinks : katalogLinks;

  function isActive(href: string) {
    if (href === "/admin" || href === "/katalog") return pathname === href;
    return pathname.startsWith(href);
  }

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 navy-gradient">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-8">
          <Link href={isAdmin ? "/admin" : "/katalog"} className="flex items-center gap-2.5">
            <span className="text-xl font-bold italic tracking-wider text-white">SWING PARAGLIDERS</span>
            <span className="rounded bg-swing-gold px-2 py-0.5 text-[10px] font-bold tracking-widest text-swing-navy">
              B2B
            </span>
          </Link>

          <nav className="hidden gap-1 md:flex">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded px-3 py-1.5 text-sm font-medium transition-all duration-200 ${
                  isActive(link.href)
                    ? "bg-white/10 text-swing-gold"
                    : "text-white/70 hover:bg-white/5 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {!isAdmin && (
            <Link
              href="/katalog/warenkorb"
              aria-label={`Warenkorb${cartCount > 0 ? `, ${cartCount} Artikel` : ""}`}
              className="relative rounded p-2 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
            >
              <ShoppingCart size={20} />
              {cartCount > 0 && (
                <span className="pulse-gold absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-swing-gold text-[10px] font-bold text-swing-navy">
                  {cartCount}
                </span>
              )}
            </Link>
          )}

          {userName && (
            <span className="hidden text-sm font-medium text-white/50 md:block">
              {userName}
            </span>
          )}

          {isAdmin ? (
            <Link
              href="/katalog"
              aria-label="Zum Katalog"
              className="rounded p-2 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
              title="Zum Katalog"
            >
              <User size={18} />
            </Link>
          ) : showAdminLink ? (
            <Link
              href="/admin"
              aria-label="Admin-Bereich"
              className="rounded p-2 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
              title="Admin"
            >
              <Settings size={18} />
            </Link>
          ) : null}

          <button
            onClick={handleLogout}
            aria-label="Abmelden"
            className="rounded p-2 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
            title="Abmelden"
          >
            <LogOut size={18} />
          </button>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? "Menü schließen" : "Menü öffnen"}
            className="rounded p-2 text-white/70 hover:bg-white/10 md:hidden"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <nav className="border-t border-white/10 px-4 pb-4 pt-2 md:hidden">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className={`block rounded px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive(link.href)
                  ? "bg-white/10 text-swing-gold"
                  : "text-white/70 hover:bg-white/5 hover:text-white"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
