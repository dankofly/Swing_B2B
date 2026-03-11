"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ShoppingCart, LogOut, User, ExternalLink, Settings, ChevronRight, Megaphone } from "lucide-react";
import { useState, useEffect } from "react";
import { useDict } from "@/lib/i18n/context";
import LanguageSwitcher from "./LanguageSwitcher";
import TranslateButton from "./TranslateButton";

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
  const [scrolled, setScrolled] = useState(false);
  const dict = useDict();

  // Track scroll for header elevation
  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 8);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

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
    { href: "/admin/news", label: "News", icon: Megaphone },
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
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "header-elevated"
          : "border-b border-white/6"
      }`}
    >
      {/* Main header bar */}
      <div className="header-bg">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:h-16 sm:px-6">
          {/* Left: Logo + Nav */}
          <div className="flex items-center gap-4 lg:gap-6">
            {/* Logo */}
            <Link
              href={isAdmin ? "/admin" : `/katalog${alsSuffix}`}
              className="group flex items-center gap-2.5"
            >
              <div className="flex items-baseline gap-1">
                <span className="text-lg font-bold italic tracking-[0.15em] text-white transition-colors duration-200 group-hover:text-swing-gold sm:text-xl">
                  SWING
                </span>
                <span className="hidden text-lg font-bold italic tracking-[0.15em] text-white/80 transition-colors duration-200 group-hover:text-white lg:inline">
                  PARAGLIDERS
                </span>
              </div>
              <span className="header-b2b-badge">
                B2B
              </span>
            </Link>

            {/* Separator */}
            <div className="hidden h-6 w-px bg-white/8 md:block" />

            {/* Desktop Navigation */}
            <nav className="hidden items-center md:flex">
              {links.map((link) => {
                const Icon = link.icon;
                const active = isActive(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`header-nav-link ${active ? "header-nav-link-active" : ""}`}
                  >
                    {Icon && <Icon size={12} />}
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center">
            {/* Cart (katalog only) */}
            {!isAdmin && (
              <Link
                href={`/katalog/warenkorb${alsSuffix}`}
                aria-label={`${dict.cart.title}${cartCount > 0 ? `, ${cartCount} ${dict.cart.items}` : ""}`}
                className="header-icon-btn relative"
              >
                <ShoppingCart size={18} />
                {cartCount > 0 && (
                  <span className="header-cart-badge">
                    {cartCount}
                  </span>
                )}
              </Link>
            )}

            {/* Separator before user area */}
            <div className="mx-1.5 hidden h-5 w-px bg-white/8 sm:mx-2.5 sm:block" />

            {/* User name */}
            {userName && (
              <span className="hidden max-w-30 truncate text-[11px] font-medium tracking-wide text-white/35 lg:block">
                {userName}
              </span>
            )}

            {/* Language + Translate */}
            <div className="flex items-center">
              <LanguageSwitcher />
              {isAdmin && <TranslateButton />}
            </div>

            {/* Profile */}
            <Link
              href={isAdmin ? "/admin/profil" : `/katalog/profil${alsSuffix}`}
              aria-label={dict.common.nav.profil}
              className="header-icon-btn"
              title={dict.common.nav.profil}
            >
              <User size={17} />
            </Link>

            {/* Logout (desktop) */}
            <button
              onClick={handleLogout}
              aria-label={dict.common.nav.abmelden}
              className="header-icon-btn hidden sm:flex"
              title={dict.common.nav.abmelden}
            >
              <LogOut size={17} />
            </button>

            {/* Mobile toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? dict.common.nav.menuClose : dict.common.nav.menuOpen}
              className="header-icon-btn md:hidden"
            >
              <div className="relative h-4.5 w-4.5">
                <span
                  className={`absolute left-0 h-[1.5px] w-full rounded-full bg-current transition-all duration-300 ${
                    mobileOpen ? "top-2 rotate-45" : "top-0.75"
                  }`}
                />
                <span
                  className={`absolute left-0 top-2 h-[1.5px] w-full rounded-full bg-current transition-all duration-200 ${
                    mobileOpen ? "scale-x-0 opacity-0" : ""
                  }`}
                />
                <span
                  className={`absolute left-0 h-[1.5px] w-full rounded-full bg-current transition-all duration-300 ${
                    mobileOpen ? "top-2 -rotate-45" : "top-3.25"
                  }`}
                />
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Gold accent line */}
      <div className="header-gold-line" />

      {/* Mobile navigation overlay */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-out ${
          mobileOpen ? "max-h-100 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <nav className="header-bg border-t border-white/6 px-4 pb-5 pt-3">
          <div className="space-y-0.5">
            {links.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex min-h-11 items-center justify-between rounded-lg px-3.5 text-[13px] font-semibold tracking-wide transition-all duration-200 ${
                    active
                      ? "bg-white/8 text-swing-gold"
                      : "text-white/60 hover:bg-white/4 hover:text-white/90"
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    {Icon && <span className="opacity-60"><Icon size={14} /></span>}
                    {link.label}
                  </span>
                  {active && (
                    <span className="flex h-1.5 w-1.5 rounded-full bg-swing-gold" />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Mobile footer section */}
          <div className="mt-3 border-t border-white/6 pt-3">
            {userName && (
              <div className="mb-2 flex items-center gap-2 px-3.5">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/8">
                  <User size={12} className="text-white/40" />
                </div>
                <span className="text-[11px] font-medium tracking-wide text-white/30">
                  {userName}
                </span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <button
                onClick={handleLogout}
                className="flex min-h-11 items-center gap-2.5 rounded-lg px-3.5 text-[13px] font-semibold tracking-wide text-white/40 transition-colors duration-200 hover:text-red-400"
              >
                <LogOut size={15} />
                {dict.common.nav.abmelden}
              </button>
              <Link
                href={isAdmin ? "/admin/profil" : `/katalog/profil${alsSuffix}`}
                className="flex min-h-11 items-center gap-2 rounded-lg px-3.5 text-[13px] font-semibold tracking-wide text-white/40 transition-colors duration-200 hover:text-white/80"
              >
                {dict.common.nav.profil}
                <ChevronRight size={14} />
              </Link>
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
}
