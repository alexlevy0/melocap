import { useTranslations } from "next-intl";

export default function HomePage() {
  const t = useTranslations("home");
  const tApp = useTranslations("app");

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-display font-bold gradient-text-primary">
          {tApp("name")}
        </h1>
        <p className="text-lg text-slate-400">{tApp("tagline")}</p>
        <p className="text-sm text-slate-500 max-w-md">{tApp("description")}</p>
        <div className="mt-8 p-6 glass rounded-3xl">
          <p className="text-slate-400 text-sm">
            🚧 Sprint 1 en cours — {t("countdown.title")}...
          </p>
        </div>
      </div>
    </main>
  );
}
