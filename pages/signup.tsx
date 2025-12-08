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

      <div className="relative z-10 w-full max-w-sm rounded-2xl border border-white/30 bg-white/70 p-8 shadow-xl backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/80">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="bg-primary/10 text-primary mb-2 flex h-12 w-12 items-center justify-center rounded-full">
            <Globe2 className="h-6 w-6" />
          </div>

          <h1 className="text-4xl font-black tracking-tight text-[#0A2A43] dark:text-white">
            wandr<span className="text-primary">.</span>
          </h1>

          <h2 className="mt-4 text-3xl font-black tracking-tight text-[#0A2A43] dark:text-white">
            Create your account
          </h2>

          <p className="text-muted-foreground mt-2 text-sm font-medium dark:text-slate-300">
            Join a community of travelers exploring the world.
          </p>

          <p className="mt-1 text-sm font-medium text-slate-800 dark:text-slate-200">
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
              className="rounded-xl border-white/50 bg-white/70 text-slate-900 shadow-sm placeholder:text-slate-400 dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-100 dark:placeholder:text-slate-500"
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
              className="rounded-xl border-white/50 bg-white/70 text-slate-900 shadow-sm placeholder:text-slate-400 dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-100 dark:placeholder:text-slate-500"
            />
          </div>

          <div className="grid gap-1 text-left">
            <Label className="text-sm font-semibold text-slate-800 dark:text-slate-100">
              Handle
            </Label>
            <div className="relative">
              <AtSign className="absolute top-3 left-2 h-4 w-4 text-gray-500 dark:text-slate-400" />
              <Input
                className="rounded-xl border-white/50 bg-white/70 pl-8 text-slate-900 shadow-sm placeholder:text-slate-400 dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-100 dark:placeholder:text-slate-500"
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
              className="rounded-xl border-white/50 bg-white/70 text-slate-900 shadow-sm placeholder:text-slate-400 dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-100 dark:placeholder:text-slate-500"
            />
          </div>

          <Button
            className="mt-2 w-full rounded-xl py-6 text-lg font-bold shadow-md"
            onClick={signUp}
          >
            Sign Up
          </Button>
        </div>
      </div>
    </div>
  );
}
