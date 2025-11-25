"use client";

import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { createSupabaseComponentClient } from "@/utils/supabase/clients/component";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { Globe2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createSupabaseComponentClient();

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

    router.push("/explore");
  };

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center p-6">
      {/* Outer card */}
      <div className="w-full max-w-sm bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg p-8 border">

        {/* Logo + header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="h-12 w-12 flex items-center justify-center rounded-full bg-primary/10 text-primary">
            <Globe2 className="h-6 w-6" />
          </div>

          <h1 className="mt-4 text-3xl font-extrabold tracking-tight">
            WANDR<span className="text-primary">.</span>
          </h1>

          <p className="text-muted-foreground text-sm mt-2">
            Log in to continue exploring the world.
          </p>

          <p className="text-sm mt-1">
            Don’t have an account?{" "}
            <Link href="/signup" className="text-primary underline">
              Sign up here
            </Link>
          </p>
        </div>

        {/* Form */}
        <div className="flex flex-col gap-5">
          <div className="grid gap-1">
            <Label>Email</Label>
            <Input
              type="email"
              placeholder="you@example.com"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="grid gap-1">
            <Label>Password</Label>
            <Input
              type="password"
              placeholder="your password"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <Button className="w-full mt-2 text-lg" onClick={logIn}>
            Log In
          </Button>
        </div>

      </div>
    </div>
  );
}
