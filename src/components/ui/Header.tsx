"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ShoppingCart, LogOut, User, Menu, X, ExternalLink, Settings } from "lucide-react";
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
  const searchParams = useSearchParams();
  const [mobileOpen, setMobileOpen] = useState(false);
  const dict = useDict();

  // Preserve "als" param across katalog navigation
  const als = searchParams.get("als");
  const alsSuffix = als ? `?als=${als}` : "";

  type NavLink = { href: string; label: string; icon?: React.ComponentType<{ size?: number }> };

  const adminLinks: NavLink[] = [
    { href: "/admin", label: dict.common.nav.dashboard },
    { href: "/admin/produkte", label: dict.common.nav.produkte },
    { href: "/admin/kunden", label: dict.common.nav.kunden },
    { href: "/admin/lager", label: dict.common.nav.lager },
    { href: "/admin/anfragen", label: dict.common.nav.anfragen },
    { href: "/katalog", label: dict.common.nav.katalog, icon: ExternalLink },
  ];

  const katalogLinks: NavLink[] = [
    { href: `/katalog${alsSuffix}`, label: dict.common.nav.katalog },
    ...(!showAdminLink ? [
      { href: `/katalog/dashboard${alsSuffix}`, label: dict.common.nav.dashboard },
      { href: `/katalog/anfragen${alsSuffix}`, label: dict.common.nav.anfragen },
    ] : []),
    ...(showAdminLink ? [{ href: "/admin", label: dict.common.nav.adminBereich, icon: Settings }] : []),
  ];

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const links = isAdmin ? adminLinks : katalogLinks;

  function isActive(href: string) {
    const path = href.split("?")[0];
    if (path === "/admin" || path === "/katalog") return pathname === path;
    return pathname.startsWith(path);
  }

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 navy-gradient">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-8">
          <Link href={isAdmin ? "/admin" : `/katalog${alsSuffix}`} className="flex items-center gap-2">
            <span className="text-base font-bold italic tracking-wider text-white sm:text-xl">SWING</span>
            <span className="hidden font-bold italic tracking-wider text-white sm:inline">PARAGLIDERS</span>
            <span className="rounded bg-swing-gold px-2 py-0.5 text-[10px] font-bold tracking-widest text-swing-navy">
              B2B
            </span>
          </Link>

          <nav className="hidden gap-1 md:flex">
            {links.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1.5 rounded px-3 py-1.5 text-sm font-medium transition-all duration-200 ${
                    isActive(link.href)
                      ? "bg-white/10 text-swing-gold"
                      : "text-white/70 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  {Icon && <Icon size={13} />}
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-1 sm:gap-3">
          {!isAdmin && (
            <Link
              href={`/katalog/warenkorb${alsSuffix}`}
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

          <Link
            href={isAdmin ? "/admin/profil" : `/katalog/profil${alsSuffix}`}
            aria-label={dict.common.nav.profil}
            className="flex h-11 w-11 items-center justify-center rounded text-white/60 transition-colors hover:bg-white/10 hover:text-white"
            title={dict.common.nav.profil}
          >
            <User size={18} />
          </Link>

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
