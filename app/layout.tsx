import type { Metadata } from "next";
import NavBar from "./components/NavBar";

// These styles apply to every route in the application
import "@/app/global.css";

export const metadata: Metadata = {
  title: "UCLID Hub Prenet",
  description: "UCLID Hub Prenet",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <NavBar />
        {children}
      </body>
    </html>
  );
}
