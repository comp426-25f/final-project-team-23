"use client";

import { useEffect, useState } from "react";
import { createSupabaseComponentClient } from "@/utils/supabase/clients/component";
import { User } from "@supabase/supabase-js";

export function useAuth() {
  const supabase = createSupabaseComponentClient();

  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user ?? null);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      },
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  return { user, isLoading };
}
