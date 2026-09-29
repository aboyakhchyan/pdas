import { useTranslations } from "next-intl";
import { Badge, Button } from "@hyework/ui";
import { BriefcaseIcon, Icon, SearchIcon } from "@hyework/ui/icons";

export default function HomePage() {
  const t = useTranslations("HomePage");

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6">
      <Icon icon={BriefcaseIcon} size={32} className="text-blue-600" />
      <Badge>Beta</Badge>
      <h1 className="text-4xl font-bold">{t("title")}</h1>
      <p className="text-lg text-gray-600">{t("subtitle")}</p>
      <Button>
        <Icon icon={SearchIcon} size={16} />
        {t("cta")}
      </Button>
    </main>
  );
}
