"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { SessionProvider } from "next-auth/react";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: "#4A90FF",
          colorBackground: "#0f0f11",
          colorInputBackground: "#141418",
          colorInputText: "#f6f4ef",
          colorText: "#f6f4ef",
          colorTextSecondary: "#9b9ba3",
        },
      }}
    >
      <SessionProvider>{children}</SessionProvider>
    </ClerkProvider>
  );
}
