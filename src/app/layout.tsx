import type { Metadata } from "next";
import { Inter, Fira_Code, Outfit } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { VisitorTracker } from "@/components/visitor-tracker";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

const firaCode = Fira_Code({
  variable: "--font-fira-code",
  subsets: ["latin"],
  display: "swap",
});

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "Rajan Prakash Chand — Network Engineer & MSc IT Researcher",
  description:
    "Personal portfolio of Rajan Prakash Chand. 5+ years managing large-scale ISP infrastructure — networks trusted by 500,000+ users at WorldLink and Dish Media. Currently pursuing MSc IT at UWS, Scotland.",
  keywords: [
    "Rajan Prakash Chand",
    "Network Engineer",
    "MSc IT",
    "ISP",
    "WorldLink",
    "Dish Media",
    "Portfolio",
    "Nepal",
    "Scotland",
  ],
  authors: [{ name: "Rajan Prakash Chand" }],
  openGraph: {
    title: "Rajan Prakash Chand — Network Engineer & MSc IT Researcher",
    description:
      "View the professional portfolio, network engineering projects, and research of Rajan Prakash Chand.",
    url: "https://rajanchand.com.np",
    siteName: "Rajan Prakash Chand",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Rajan Prakash Chand — Network Engineer & MSc IT Researcher",
    description:
      "View the professional portfolio, network engineering projects, and research of Rajan Prakash Chand.",
  },
  metadataBase: new URL("https://rajanchand.com.np"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${outfit.variable} ${firaCode.variable} min-h-screen antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          forcedTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}
          <VisitorTracker />
        </ThemeProvider>
      </body>
    </html>
  );
}
