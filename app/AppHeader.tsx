"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

export default function AppHeader() {
  const pathname = usePathname();
  const router = useRouter();

  // ✅ In-progress attempt page: /attempt/<attemptId>
  // ❌ Result page: /attempt/<attemptId>/result  -> should show Home
  const isAttemptRoute = pathname?.startsWith("/attempt/");
  const isResultPage = pathname?.includes("/result");
  const showExitQuiz = Boolean(isAttemptRoute && !isResultPage);

  const [showExitModal, setShowExitModal] = useState(false);

  const goToQuizzes = () => {
    setShowExitModal(false);
    router.push("/quizzes");
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-50 border-b bg-white">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
        <div className="text-sm font-semibold tracking-wide">MCQ Platform</div>

        {showExitQuiz ? (
          <>
            <button
              type="button"
              onClick={() => setShowExitModal(true)}
              className="rounded border px-3 py-2 text-sm hover:bg-gray-50"
            >
              Exit Quiz
            </button>

            {showExitModal && (
              <div
                className="fixed inset-0 z-50 flex items-center justify-center"
                aria-modal="true"
                role="dialog"
              >
                {/* Backdrop */}
                <div
                  className="absolute inset-0 bg-black/40"
                  onClick={() => setShowExitModal(false)}
                />

                {/* Modal */}
                <div className="relative w-full max-w-md rounded-xl bg-white p-4 shadow-lg">
                  <div className="mb-2 text-lg font-semibold">
                    Leave this attempt?
                  </div>

                  <div className="text-sm text-gray-700">
                    Your progress is saved. You can come back later and continue
                    this attempt from the Quizzes page.
                  </div>

                  <div className="mt-4 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowExitModal(false)}
                      className="rounded border px-3 py-2 text-sm hover:bg-gray-50"
                    >
                      Stay
                    </button>

                    <button
                      type="button"
                      onClick={goToQuizzes}
                      className="rounded bg-black px-3 py-2 text-sm text-white hover:opacity-90"
                    >
                      Go to Quizzes
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <Link
            href="/quizzes"
            className="rounded border px-3 py-2 text-sm hover:bg-gray-50"
          >
            Home
          </Link>
        )}
      </div>
    </header>
  );
}