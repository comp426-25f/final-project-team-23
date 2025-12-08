"use client";

import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";

import { createSupabaseComponentClient } from "@/utils/supabase/clients/component";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { Globe2, AtSign, Cloud } from "lucide-react";

import { api } from "@/utils/trpc/api";

export default function SignUpPage() {
  const router = useRouter();
  const supabase = createSupabaseComponentClient();
  const apiUtils = api.useUtils();

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [handle, setHandle] = useState("");
  const [password, setPassword] = useState("");

  const { mutate: handleNewUser } = api.profiles.handleNewUser.useMutation();

  const signUp = async () => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, handle },
      },
    });

    if (error) {
      alert(error.message);
      return;
    }

    if (!data.user) {
      alert("User could not be created. Please try again.");
      return;
    }

    handleNewUser({ name, handle });

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

      <div className="relative z-10 w-full max-w-sm bg-white/70 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/30 dark:border-slate-800 p-8">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="h-12 w-12 flex items-center justify-center rounded-full bg-primary/10 text-primary mb-2">
            <Globe2 className="h-6 w-6" />
          </div>

          <h1 className="text-4xl font-black tracking-tight text-[#0A2A43] dark:text-white">
            wandr<span className="text-primary">.</span>
          </h1>

          <h2 className="mt-4 text-3xl font-black tracking-tight text-[#0A2A43] dark:text-white">
            Create your account
          </h2>

          <p className="text-muted-foreground dark:text-slate-300 text-sm mt-2 font-medium">
            Join a community of travelers exploring the world.
          </p>

          <p className="text-sm mt-1 font-medium text-slate-800 dark:text-slate-200">
            Already have an account?{" "}
            <Link href="/login" className="text-primary underline">
              Log in here
            </Link>
          </p>
        </div>

        <div className="flex flex-col gap-5">
          <div className="grid gap-1 text-left">
            <Label className="text-sm font-semibold text-slate-800 dark:text-slate-100">
              Email
            </Label>
            <Input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-xl border-white/50 dark:border-slate-700 bg-white/70 dark:bg-slate-800/70 shadow-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
            />
          </div>

          <div className="grid gap-1 text-left">
            <Label className="text-sm font-semibold text-slate-800 dark:text-slate-100">
              Full Name
            </Label>
            <Input
              placeholder="Jane Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="rounded-xl border-white/50 dark:border-slate-700 bg-white/70 dark:bg-slate-800/70 shadow-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
            />
          </div>

          <div className="grid gap-1 text-left">
            <Label className="text-sm font-semibold text-slate-800 dark:text-slate-100">
              Handle
            </Label>
            <div className="relative">
              <AtSign className="absolute left-2 top-3 h-4 w-4 text-gray-500 dark:text-slate-400" />
              <Input
                className="pl-8 rounded-xl border-white/50 dark:border-slate-700 bg-white/70 dark:bg-slate-800/70 shadow-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                placeholder="jane"
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-1 text-left">
            <Label className="text-sm font-semibold text-slate-800 dark:text-slate-100">
              Password
            </Label>
            <Input
              type="password"
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-xl border-white/50 dark:border-slate-700 bg-white/70 dark:bg-slate-800/70 shadow-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
            />
          </div>

          <Button className="w-full py-6 rounded-xl text-lg font-bold shadow-md mt-2" onClick={signUp}>
            Sign Up
          </Button>
        </div>
      </div>
    </div>
  );
}
