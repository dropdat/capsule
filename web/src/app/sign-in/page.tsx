"use client";
import { SignIn } from "@clerk/react";

export const dynamic = "force-static";

export default function SignInPage() {
  return (
    <main className="relative z-[2] min-h-screen flex items-center justify-center px-4 sm:px-6 py-16 sm:py-20">
      <SignIn routing="hash" />
    </main>
  );
}
