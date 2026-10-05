// Root layout lives in app/[locale]/layout.tsx so <html lang> can follow the locale.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
