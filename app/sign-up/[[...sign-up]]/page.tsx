import { SignUp } from "@clerk/nextjs";
import type { Metadata } from "next";

import { clerkAppearance } from "@/lib/auth/clerk-appearance";

export const metadata: Metadata = {
  title: "Sign Up",
};

export default function SignUpPage() {
  return (
    <div className="container section section--tight auth-page">
      <SignUp appearance={clerkAppearance} />
    </div>
  );
}
