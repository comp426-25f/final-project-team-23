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
    <div className="horizon-bg relative flex min-h-screen items-center justify-center overflow-hidden p-6">
      <div className="absolute top-10 right-24 z-0">
        <Cloud className="h-36 w-36 fill-white text-white opacity-80 blur-[2px]" />
      </div>
      <div className="absolute top-25 left-30 z-0">
        <Cloud className="h-44 w-44 fill-white text-white opacity-75 blur-[3px]" />
      </div>

      <div className="pointer-events-none absolute right-0 bottom-0 z-10 translate-x-[30%] translate-y-[30%]">
        <Globe2 className="h-[600px] w-[600px] text-[#4ab5ff] opacity-30 blur-[6px]" />
      </div>

      <div className="z-20 w-full max-w-sm rounded-2xl border border-white/30 bg-white/70 p-8 shadow-xl backdrop-blur-xl">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="bg-primary/10 text-primary mb-2 flex h-12 w-12 items-center justify-center rounded-full">
            <Globe2 className="h-6 w-6" />
          </div>
          <h1 className="text-4xl font-black tracking-tight text-[#0A2A43]">
            wandr<span className="text-primary">.</span>
          </h1>
          <p className="text-muted-foreground mt-1 text-sm font-medium">
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
              className="focus:ring-primary rounded-xl border-white/40 bg-white/60 shadow-sm"
            />
          </div>

          <div className="grid gap-1 text-left">
            <label className="text-sm font-semibold">Password</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="focus:ring-primary rounded-xl border-white/40 bg-white/60 shadow-sm"
            />
          </div>

          <Button
            onClick={logIn}
            className="w-full rounded-xl py-5 font-bold shadow-md"
          >
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
