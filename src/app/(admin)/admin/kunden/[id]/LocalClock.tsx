"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import { useDict, useLocale } from "@/lib/i18n/context";
import { getDateLocale } from "@/lib/i18n/shared";

const COUNTRY_TIMEZONES: Record<string, string> = {
  Deutschland: "Europe/Berlin",
  Germany: "Europe/Berlin",
  Österreich: "Europe/Vienna",
  Austria: "Europe/Vienna",
  Schweiz: "Europe/Zurich",
  Switzerland: "Europe/Zurich",
  Frankreich: "Europe/Paris",
  France: "Europe/Paris",
  Italien: "Europe/Rome",
  Italy: "Europe/Rome",
  Spanien: "Europe/Madrid",
  Spain: "Europe/Madrid",
  Portugal: "Europe/Lisbon",
  Niederlande: "Europe/Amsterdam",
  Netherlands: "Europe/Amsterdam",
  Belgien: "Europe/Brussels",
  Belgium: "Europe/Brussels",
  Tschechien: "Europe/Prague",
  "Czech Republic": "Europe/Prague",
  Polen: "Europe/Warsaw",
  Poland: "Europe/Warsaw",
  Ungarn: "Europe/Budapest",
  Hungary: "Europe/Budapest",
  Slowenien: "Europe/Ljubljana",
  Slovenia: "Europe/Ljubljana",
  Kroatien: "Europe/Zagreb",
  Croatia: "Europe/Zagreb",
  Griechenland: "Europe/Athens",
  Greece: "Europe/Athens",
  Türkei: "Europe/Istanbul",
  Turkey: "Europe/Istanbul",
  Grossbritannien: "Europe/London",
  "United Kingdom": "Europe/London",
  England: "Europe/London",
  Schweden: "Europe/Stockholm",
  Sweden: "Europe/Stockholm",
  Norwegen: "Europe/Oslo",
  Norway: "Europe/Oslo",
  Dänemark: "Europe/Copenhagen",
  Denmark: "Europe/Copenhagen",
  Finnland: "Europe/Helsinki",
  Finland: "Europe/Helsinki",
  Japan: "Asia/Tokyo",
  China: "Asia/Shanghai",
  Südkorea: "Asia/Seoul",
  "South Korea": "Asia/Seoul",
  Indien: "Asia/Kolkata",
  India: "Asia/Kolkata",
  Australien: "Australia/Sydney",
  Australia: "Australia/Sydney",
  Neuseeland: "Pacific/Auckland",
  "New Zealand": "Pacific/Auckland",
  USA: "America/New_York",
  "United States": "America/New_York",
  Kanada: "America/Toronto",
  Canada: "America/Toronto",
  Brasilien: "America/Sao_Paulo",
  Brazil: "America/Sao_Paulo",
  Russland: "Europe/Moscow",
  Russia: "Europe/Moscow",
  Israel: "Asia/Jerusalem",
  Südafrika: "Africa/Johannesburg",
  "South Africa": "Africa/Johannesburg",
  Thailand: "Asia/Bangkok",
  Indonesien: "Asia/Jakarta",
  Indonesia: "Asia/Jakarta",
  Malaysia: "Asia/Kuala_Lumpur",
  Singapur: "Asia/Singapore",
  Singapore: "Asia/Singapore",
  Taiwan: "Asia/Taipei",
  Vietnam: "Asia/Ho_Chi_Minh",
  Philippinen: "Asia/Manila",
  Philippines: "Asia/Manila",
  Mexiko: "America/Mexico_City",
  Mexico: "America/Mexico_City",
  Argentinien: "America/Argentina/Buenos_Aires",
  Argentina: "America/Argentina/Buenos_Aires",
  Chile: "America/Santiago",
  Kolumbien: "America/Bogota",
  Colombia: "America/Bogota",
  Peru: "America/Lima",
  Rumänien: "Europe/Bucharest",
  Romania: "Europe/Bucharest",
  Bulgarien: "Europe/Sofia",
  Bulgaria: "Europe/Sofia",
  Serbien: "Europe/Belgrade",
  Serbia: "Europe/Belgrade",
  Irland: "Europe/Dublin",
  Ireland: "Europe/Dublin",
  Island: "Atlantic/Reykjavik",
  Iceland: "Atlantic/Reykjavik",
};

export default function LocalClock({ country }: { country: string }) {
  const dict = useDict();
  const locale = useLocale();
  const dl = getDateLocale(locale);
  const [time, setTime] = useState<string>("");

  const tz = COUNTRY_TIMEZONES[country];

  useEffect(() => {
    if (!tz) return;

    function update() {
      const now = new Date();
      setTime(
        now.toLocaleTimeString(dl, {
          timeZone: tz,
          hour: "2-digit",
          minute: "2-digit",
        })
      );
    }

    update();
    const id = setInterval(update, 30_000);
    return () => clearInterval(id);
  }, [tz, dl]);

  if (!tz || !time) return null;

  return (
    <div className="flex items-center gap-1.5 text-[11px] text-swing-navy/50">
      <Clock size={11} />
      <span>{dict.admin.customers.detail.localTime} {country}: <span className="font-semibold text-swing-navy/70">{time}</span></span>
    </div>
  );
}
