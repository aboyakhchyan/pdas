import { useTranslations } from "next-intl";
import { Button } from "@hyework/ui";

export default function HomePage() {
  const t = useTranslations("HomePage");

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6">
      <h1 className="text-4xl font-bold">{t("title")}</h1>
      <p className="text-lg text-gray-600">{t("subtitle")}</p>
      <Button>{t("cta")}</Button>
    </main>
  );
}
