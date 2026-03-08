import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import { getLocale, getDictionary } from "@/lib/i18n";
import { I18nProvider } from "@/lib/i18n/context";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "SWING PARAGLIDERS - B2B Portal",
  description: "SWING PARAGLIDERS - Händlerportal",
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
        <I18nProvider locale={locale} dict={dict}>
          {children}
        </I18nProvider>
      </body>
    </html>
  );
}
