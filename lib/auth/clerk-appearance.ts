/**
 * Shared Clerk component theming so `<SignIn />` and `<SignUp />` read from
 * the site's semantic theme tokens instead of Clerk's default palette.
 * This themes Clerk's own components; it is not a custom auth screen.
 */
export const clerkAppearance = {
  variables: {
    colorPrimary: "var(--accent)",
    colorBackground: "var(--surface-panel)",
    colorInput: "var(--surface)",
    colorForeground: "var(--text)",
    colorMutedForeground: "var(--text-muted)",
    colorDanger: "var(--danger)",
    borderRadius: "0px",
    fontFamily: "var(--font-body)",
  },
} as const;
