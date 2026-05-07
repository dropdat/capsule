"use client";
import { SignUp } from "@clerk/react";

export const dynamic = "force-static";

export default function SignUpPage() {
  return (
    <main className="relative z-[2] min-h-screen flex items-center justify-center px-6 py-20">
      <SignUp routing="hash" />
    </main>
  );
}
