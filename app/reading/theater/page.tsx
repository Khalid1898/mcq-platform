import { loadReadingPassage } from "@/lib/content/reading";
import { PassageOnlyView } from "@/modules/reading/PassageOnlyView";

export default async function ReadingTheaterPage() {
  const passage = await loadReadingPassage("passage-001");
  return <PassageOnlyView passage={passage} />;
}

