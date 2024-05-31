import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Uclid Devnet",
  description: "Uclid Devnet",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
