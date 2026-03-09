import type { Metadata, Viewport } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import { getLocale, getDictionary } from "@/lib/i18n";
import { I18nProvider } from "@/lib/i18n/context";
import LandingFooter from "@/components/ui/LandingFooter";
import PwaRegister from "@/components/PwaRegister";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "SWING PARAGLIDERS - B2B Portal",
  description: "SWING PARAGLIDERS - Händlerportal",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "SWING B2B",
  },
  icons: {
    icon: [
      { url: "/icons/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/favicon-16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: "/icons/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#173045",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const dict = await getDictionary(locale);

  return (
    <html lang={locale}>
      <body className={`${montserrat.variable} font-sans antialiased`}>
        <PwaRegister />
        <I18nProvider locale={locale} dict={dict}>
          <div className="flex min-h-screen flex-col">
            <div className="flex-1">{children}</div>
            <LandingFooter />
          </div>
        </I18nProvider>
      </body>
    </html>
  );
}
