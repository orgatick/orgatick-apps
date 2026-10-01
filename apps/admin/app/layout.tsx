import { Source_Code_Pro, Source_Sans_3 } from "next/font/google";
import "./globals.css";
import { cn } from "@orgatick/ui/lib/utils";
import metadataConfig from "@/config/metadata";
import Providers from "@/providers";

const sourceSans3 = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-sans",
});

const sourceCodePro = Source_Code_Pro({
  subsets: ["latin"],
  variable: "--font-source-code-pro",
});

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata = metadataConfig;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={cn("h-dvh", "antialiased", "font-sans", sourceSans3.variable, sourceCodePro.variable)}
      suppressHydrationWarning
    >
      <body className="min-h-full">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
