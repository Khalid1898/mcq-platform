import { loadReadingPassage } from "@/lib/content/reading";
import { ReadingSession } from "@/modules/reading/ReadingSession";

export default async function ReadingTheaterPage() {
  const passage = await loadReadingPassage("passage-001");
  return <ReadingSession passage={passage} />;
}

