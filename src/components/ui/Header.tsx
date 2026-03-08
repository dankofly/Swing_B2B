"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ShoppingCart, LogOut, User, Settings, Menu, X } from "lucide-react";
import { useState } from "react";
import { useDict } from "@/lib/i18n/context";
import LanguageSwitcher from "./LanguageSwitcher";

interface HeaderProps {
  isAdmin?: boolean;
  showAdminLink?: boolean;
  userName?: string;
  cartCount?: number;
}

export default function Header({
  isAdmin = false,
  showAdminLink = false,
  userName,
  cartCount = 0,
}: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const dict = useDict();

  const adminLinks = [
    { href: "/admin", label: dict.common.nav.dashboard },
    { href: "/admin/produkte", label: dict.common.nav.produkte },
    { href: "/admin/kunden", label: dict.common.nav.kunden },
    { href: "/admin/lager", label: dict.common.nav.lager },
    { href: "/admin/anfragen", label: dict.common.nav.anfragen },
  ];

  const katalogLinks = [
    { href: "/katalog", label: dict.common.nav.katalog },
    { href: "/katalog/dashboard", label: dict.common.nav.dashboard },
    { href: "/katalog/anfragen", label: dict.common.nav.anfragen },
    { href: "/katalog/profil", label: dict.common.nav.profil },
  ];

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
          <Link href={isAdmin ? "/admin" : "/katalog"} className="flex items-center gap-2">
            <span className="text-base font-bold italic tracking-wider text-white sm:text-xl">SWING</span>
            <span className="hidden font-bold italic tracking-wider text-white sm:inline">PARAGLIDERS</span>
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

        <div className="flex items-center gap-1 sm:gap-3">
          {!isAdmin && (
            <Link
              href="/katalog/warenkorb"
              aria-label={`${dict.cart.title}${cartCount > 0 ? `, ${cartCount} ${dict.cart.items}` : ""}`}
              className="relative flex h-11 w-11 items-center justify-center rounded text-white/70 transition-colors hover:bg-white/10 hover:text-white"
            >
              <ShoppingCart size={20} />
              {cartCount > 0 && (
                <span className="pulse-gold absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-swing-gold text-[10px] font-bold text-swing-navy">
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

          <LanguageSwitcher />

          {isAdmin ? (
            <Link
              href="/katalog"
              aria-label={dict.common.nav.zumKatalog}
              className="flex h-11 w-11 items-center justify-center rounded text-white/60 transition-colors hover:bg-white/10 hover:text-white"
              title={dict.common.nav.zumKatalog}
            >
              <User size={18} />
            </Link>
          ) : showAdminLink ? (
            <Link
              href="/admin"
              aria-label={dict.common.nav.adminBereich}
              className="flex h-11 w-11 items-center justify-center rounded text-white/60 transition-colors hover:bg-white/10 hover:text-white"
              title={dict.common.nav.adminBereich}
            >
              <Settings size={18} />
            </Link>
          ) : null}

          <button
            onClick={handleLogout}
            aria-label={dict.common.nav.abmelden}
            className="hidden h-11 w-11 items-center justify-center rounded text-white/60 transition-colors hover:bg-white/10 hover:text-white sm:flex"
            title={dict.common.nav.abmelden}
          >
            <LogOut size={18} />
          </button>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? dict.common.nav.menuClose : dict.common.nav.menuOpen}
            className="flex h-11 w-11 items-center justify-center rounded text-white/70 hover:bg-white/10 md:hidden"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
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
              className={`flex min-h-11 items-center rounded px-3 text-sm font-medium transition-colors ${
                isActive(link.href)
                  ? "bg-white/10 text-swing-gold"
                  : "text-white/70 hover:bg-white/5 hover:text-white"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <div className="mt-2 border-t border-white/10 pt-2">
            {userName && (
              <div className="px-3 py-2 text-xs text-white/30">
                {dict.common.nav.loggedInAs} {userName}
              </div>
            )}
            <button
              onClick={() => { setMobileOpen(false); handleLogout(); }}
              className="flex min-h-11 w-full items-center gap-2 rounded px-3 text-sm font-medium text-white/70 transition-colors hover:bg-white/5 hover:text-white"
            >
              <LogOut size={16} />
              {dict.common.nav.abmelden}
            </button>
          </div>
        </nav>
      )}
    </header>
  );
}
