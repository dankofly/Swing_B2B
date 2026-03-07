"use client";

import Header from "@/components/ui/Header";
import { useCart } from "@/lib/cart";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function CartHeaderWrapper() {
  const { itemCount } = useCart();
  const [showAdminLink, setShowAdminLink] = useState(false);

  useEffect(() => {
    async function checkRole() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();
      if (profile?.role === "admin" || profile?.role === "superadmin") {
        setShowAdminLink(true);
      }
    }
    checkRole();
  }, []);

  return <Header cartCount={itemCount} showAdminLink={showAdminLink} />;
}
