import { SignIn } from "@clerk/nextjs";
import type { Metadata } from "next";

import { clerkAppearance } from "@/lib/auth/clerk-appearance";

export const metadata: Metadata = {
  title: "Sign In",
};

export default function SignInPage() {
  return (
    <div className="container section section--tight auth-page">
      <SignIn appearance={clerkAppearance} />
    </div>
  );
}
