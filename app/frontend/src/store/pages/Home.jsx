import { useSite } from "@/context/ThemeContext";
import { SECTION_COMPONENTS, CommentsSection } from "@/store/HomeSections";

export default function Home() {
  const { settings } = useSite();
  const sections = settings.home_sections || [];
  const hasCommentsSection = sections.some((s) => s.type === "comments");
  return (
    <div data-testid="home-page">
      {sections.filter((s) => s.enabled).map((s) => {
        const C = SECTION_COMPONENTS[s.type];
        return C ? <C key={s.id} id={s.id} title={s.title} config={s.config || {}} /> : null;
      })}
      {!hasCommentsSection && <CommentsSection />}
    </div>
  );
}
