// This root layout is intentionally minimal.
// The actual layout with fonts, i18n, and styles is in src/app/[locale]/layout.tsx
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
