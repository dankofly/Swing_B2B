"use client";

import Header from "@/components/ui/Header";
import { useCart } from "@/lib/cart";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function CartHeaderWrapper() {
  const { itemCount } = useCart();
  const searchParams = useSearchParams();
  const isViewingAsCustomer = !!searchParams.get("als");
  const [showAdminLink, setShowAdminLink] = useState(false);

  useEffect(() => {
    if (isViewingAsCustomer) return;
    let cancelled = false;
    async function checkRole() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user || cancelled) return;
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();
        if (!cancelled && (profile?.role === "admin" || profile?.role === "superadmin")) {
          setShowAdminLink(true);
        }
      } catch {
        // Session expired or network error — silently keep buyer view
      }
    }
    checkRole();
    return () => { cancelled = true; };
  }, [isViewingAsCustomer]);

  return <Header cartCount={itemCount} showAdminLink={showAdminLink} />;
}
