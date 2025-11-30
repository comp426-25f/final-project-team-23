"use client";

import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { createSupabaseComponentClient } from "@/utils/supabase/clients/component";
import { api } from "@/utils/trpc/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
import { Cloud } from "lucide-react";

import { Globe2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createSupabaseComponentClient();
  const apiUtils = api.useUtils();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const logIn = async () => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      window.alert(`Error logging in: ${error.message}`);
      return;
    }

    if (!data.user) {
      window.alert("No user found. Please try again.");
      return;
    }

    await apiUtils.invalidate();

    router.push("/");
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-6 overflow-hidden horizon-bg">

    <div className="absolute top-10 right-24 z-0">
      <Cloud className="w-36 h-36 fill-white text-white opacity-80 blur-[2px]" />
    </div>
    <div className="absolute top-25 left-30 z-0">
      <Cloud className="w-44 h-44 fill-white text-white opacity-75 blur-[3px]" />
    </div>

    <div className="absolute bottom-0 right-0 z-10 pointer-events-none translate-x-[30%] translate-y-[30%]">
      <Globe2 className="w-[600px] h-[600px] text-[#4ab5ff] opacity-30 blur-[6px]" />
    </div>

      <div className="w-full max-w-sm bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl border border-white/30 p-8 z-20">
        
        <div className="flex flex-col items-center text-center mb-6">
          <div className="h-12 w-12 flex items-center justify-center rounded-full bg-primary/10 text-primary mb-2">
            <Globe2 className="h-6 w-6" />
          </div>
          <h1 className="text-4xl font-black tracking-tight text-[#0A2A43]">
            wandr<span className="text-primary">.</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1 font-medium">
            Log in to continue exploring the world.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <div className="grid gap-1 text-left">
            <label className="text-sm font-semibold">Email</label>
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="m@example.com"
              required
              className="rounded-xl bg-white/60 border-white/40 shadow-sm focus:ring-primary"
            />
          </div>

          <div className="grid gap-1 text-left">
            <label className="text-sm font-semibold">Password</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="rounded-xl bg-white/60 border-white/40 shadow-sm focus:ring-primary"
            />
          </div>

          <Button onClick={logIn} className="w-full py-5 rounded-xl font-bold shadow-md">
            Login
          </Button>

          <p className="text-center text-sm font-medium">
            Don’t have an account?{" "}
            <Link href="/signup" className="text-primary underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
