import {
  loadReadingPassage,
  loadReadingPassageAnswers,
} from "@/lib/content/reading";
import { PassageOnlyView } from "@/modules/reading/PassageOnlyView";

export default async function ReadingTheaterPage() {
  const [passage, correctAnswers] = await Promise.all([
    loadReadingPassage("passage-001"),
    loadReadingPassageAnswers("passage-001"),
  ]);
  return (
    <PassageOnlyView passage={passage} correctAnswers={correctAnswers} />
  );
}

