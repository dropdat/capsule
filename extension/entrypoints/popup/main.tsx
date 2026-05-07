import React from "react";
import { createRoot } from "react-dom/client";
import { ClerkProvider } from "@clerk/chrome-extension";
import { App } from "./App";
import { TokenSync } from "./TokenSync";

const PUBLISHABLE_KEY =
  (import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as string | undefined) ?? "";

const SYNC_HOST = (import.meta.env.VITE_DASHBOARD_URL as string | undefined) ?? "http://localhost:3000";

const root = createRoot(document.getElementById("root")!);

if (!PUBLISHABLE_KEY) {
  // Dev mode without Clerk — render app directly. Backend honours DEV_AUTH_BYPASS.
  console.warn("[dropdat] VITE_CLERK_PUBLISHABLE_KEY not set — running unauthenticated.");
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} else {
  root.render(
    <React.StrictMode>
      <ClerkProvider
        publishableKey={PUBLISHABLE_KEY}
        syncHost={SYNC_HOST}
        appearance={{
          variables: {
            colorPrimary: "#0562ef",
            colorBackground: "#ffffff",
            colorText: "#0b1015",
            borderRadius: "0px",
          },
        }}
      >
        <TokenSync />
        <App />
      </ClerkProvider>
    </React.StrictMode>
  );
}
