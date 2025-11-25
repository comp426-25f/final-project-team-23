"use client";

import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { createSupabaseComponentClient } from "@/utils/supabase/clients/component";
import { api } from "@/utils/trpc/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
    <div className="min-h-screen bg-muted/30 flex items-center justify-center p-6">
      <div className="w-full max-w-sm bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg p-8 border">

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

        <div className="flex flex-col gap-5">
          <div className="grid gap-1">
            <Label htmlFor="email">Email</Label>
                <Input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="m@example.com"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Password</Label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button className="w-full" onClick={logIn}>
                Login
              </Button>
        </div>

      </div>
    </div>
  );
}
