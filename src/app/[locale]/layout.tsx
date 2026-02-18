import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { Navigation } from "@/components/layout/Navigation";
import "@/styles/globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "MeloCaps — La curation musicale prédictive",
    template: "%s | MeloCaps",
  },
  description:
    "Rejoins un Pod, soumets ton titre, soutiens tes favoris. Le Top 50 se révèle chaque dimanche.",
  keywords: ["musique", "curation", "prédiction", "Spotify", "MeloCaps"],
  authors: [{ name: "MeloCaps" }],
  creator: "MeloCaps",
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: process.env.NEXT_PUBLIC_APP_URL,
    siteName: "MeloCaps",
    title: "MeloCaps — La curation musicale prédictive",
    description:
      "Rejoins un Pod, soumets ton titre, soutiens tes favoris. Le Top 50 se révèle chaque dimanche.",
  },
  twitter: {
    card: "summary_large_image",
    title: "MeloCaps",
    description: "La curation musicale prédictive",
  },
  robots: {
    index: true,
    follow: true,
  },
};

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  // Validate locale
  if (!routing.locales.includes(locale as "fr" | "en")) {
    notFound();
  }

  // Load messages for the current locale
  const messages = await getMessages();

  return (
    <html lang={locale} className="dark" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${outfit.variable} font-sans bg-surface-900 text-white antialiased`}
      >
        <NextIntlClientProvider messages={messages}>
          <Navigation />
          <div className="pt-16 pb-20 md:pb-0 min-h-screen">
            {children}
          </div>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
