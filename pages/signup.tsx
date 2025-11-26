"use client";

import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";

import { createSupabaseComponentClient } from "@/utils/supabase/clients/component";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { Globe2, AtSign } from "lucide-react";

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
    <div className="min-h-screen bg-muted/30 flex items-center justify-center p-6">
      <div className="w-full max-w-sm bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg p-8 border">

        <div className="flex flex-col items-center text-center mb-8">
          <div className="h-12 w-12 flex items-center justify-center rounded-full bg-primary/10 text-primary">
            <Globe2 className="h-6 w-6" />
          </div>

          <h1 className="mt-4 text-3xl font-extrabold tracking-tight">
            Create your WANDR<span className="text-primary">.</span> account
          </h1>

          <p className="text-muted-foreground text-sm mt-2">
            Join a community of travelers exploring the world.
          </p>

          <p className="text-sm mt-1">
            Already have an account?{" "}
            <Link href="/login" className="text-primary underline">
              Log in here
            </Link>
          </p>
        </div>

        <div className="flex flex-col gap-5">

          <div className="grid gap-1">
            <Label>Email</Label>
            <Input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="grid gap-1">
            <Label>Full Name</Label>
            <Input
              placeholder="Jane Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="grid gap-1">
            <Label>Handle</Label>
            <div className="relative">
              <AtSign className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-8"
                placeholder="jane"
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-1">
            <Label>Password</Label>
            <Input
              type="password"
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <Button className="w-full mt-2 text-lg" onClick={signUp}>
            Sign Up
          </Button>

        </div>
      </div>
    </div>
  );
}
