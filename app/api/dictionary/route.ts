import { NextResponse } from "next/server";
import { lookupWord } from "@/lib/dictionary";

// WordNet lookup requires Node.js runtime (filesystem access), not Edge.
export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const word = searchParams.get("word") ?? "";

  if (!word.trim()) {
    return NextResponse.json(
      { error: "Missing word parameter" },
      { status: 400 }
    );
  }

  try {
    const entry = await lookupWord(word);
    if (!entry) {
      return NextResponse.json(
        { word, definition: "No definition found.", synonyms: [] },
        { status: 200 }
      );
    }
    return NextResponse.json(entry, { status: 200 });
  } catch (error) {
    console.error("Dictionary lookup error", { word, error });
    return NextResponse.json(
      {
        word,
        definition:
          "There was a problem looking up this word locally. Please see debug info.",
        synonyms: [],
        // Temporary debug field so we can see what's going wrong.
        debug:
          error instanceof Error
            ? error.message
            : typeof error === "string"
              ? error
              : JSON.stringify(error),
      },
      { status: 500 }
    );
  }
}

