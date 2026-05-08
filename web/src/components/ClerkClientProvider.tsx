"use client";
import { ClerkProvider } from "@clerk/react";

const PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "";

export function ClerkClientProvider({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider
      publishableKey={PUBLISHABLE_KEY}
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      signInFallbackRedirectUrl="https://capsule.dropdat.app/library"
      signUpFallbackRedirectUrl="https://capsule.dropdat.app/library"
      appearance={{
        variables: {
          colorPrimary: "#0562ef",
          colorBackground: "#ffffff",
          colorText: "#0b1015",
          borderRadius: "0px",
          fontFamily: "var(--font-sans), ui-sans-serif, system-ui, sans-serif",
        },
      }}
    >
      {children}
    </ClerkProvider>
  );
}
