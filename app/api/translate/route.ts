import { NextResponse } from "next/server";
import { defaultTranslator } from "@/lib/translation/argosTranslator";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const text = String(body.text ?? "").trim();
    const sourceLang = String(body.sourceLang ?? "en");
    const targetLang = String(body.targetLang ?? "en");

    if (!text) {
      return NextResponse.json(
        { error: "Missing text" },
        { status: 400 }
      );
    }

    const result = await defaultTranslator.translate({
      text,
      sourceLang,
      targetLang,
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("Translation error", error);
    return NextResponse.json(
      { error: "Translation failed" },
      { status: 500 }
    );
  }
}

