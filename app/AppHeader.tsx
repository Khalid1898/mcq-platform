"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useTheme } from "./ThemeProvider";

export default function AppHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { setTheme } = useTheme();

  const isAttemptRoute = pathname?.startsWith("/attempt/");
  const isResultPage = pathname?.includes("/result");
  const isReadingTheater = pathname === "/reading/theater";
  const isPracticeRoute = pathname?.startsWith("/practice");
  const showExitQuiz = Boolean(isAttemptRoute && !isResultPage);

  const isAuthOrAdmin =
    pathname === "/login" ||
    pathname === "/register" ||
    pathname?.startsWith("/profile") ||
    pathname?.startsWith("/admin");

  const [showExitModal, setShowExitModal] = useState(false);

  const goToQuizzes = () => {
    setShowExitModal(false);
    router.push("/quizzes");
    router.refresh();
  };

  if (isReadingTheater) {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-surface">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-2.5 text-[15px] font-semibold text-text hover:opacity-85"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 text-sm font-bold text-primary dark:bg-emerald-900/60 dark:text-emerald-200">
            BP
          </span>
          <span>IELTS Practice</span>
        </Link>

        <div className="flex items-center gap-2">
          {isPracticeRoute ? (
            <Link
              href="/"
              className="inline-flex items-center rounded-xl border border-border bg-surface px-3 py-2 text-xs font-medium text-text hover:bg-surface-2"
            >
              Home
            </Link>
          ) : null}
          <Link
            href="/login"
            className="inline-flex items-center rounded-xl border border-border bg-surface px-3 py-2 text-xs font-medium text-text hover:bg-surface-2"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="hidden sm:inline-flex items-center rounded-xl bg-primary px-3 py-2 text-xs font-medium text-primary-foreground shadow-sm hover:bg-primary/90"
          >
            Sign up
          </Link>
          {showExitQuiz ? (
            <>
              <button
                type="button"
                onClick={() => setShowExitModal(true)}
                className="rounded-xl border-2 border-border bg-surface px-4 py-2 text-sm font-medium text-text shadow-sm hover:bg-surface-2"
              >
                Exit quiz
              </button>

              {showExitModal && (
                <div
                  className="fixed inset-0 z-50 flex items-center justify-center p-4"
                  aria-modal="true"
                  role="dialog"
                >
                  <div
                    className="absolute inset-0 bg-text/20 backdrop-blur-sm"
                    onClick={() => setShowExitModal(false)}
                  />
                  <div className="relative w-full max-w-md rounded-xl border border-border bg-surface p-6 shadow-lg">
                    <div className="mb-2 text-lg font-semibold text-text">
                      Leave this attempt?
                    </div>
                    <div className="text-[15px] leading-relaxed text-muted">
                      Your progress is saved. You can come back later and
                      continue this attempt from the Quizzes page.
                    </div>
                    <div className="mt-6 flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => setShowExitModal(false)}
                        className="rounded-xl border-2 border-border px-4 py-2 text-sm font-medium text-text hover:bg-surface-2"
                      >
                        Stay
                      </button>
                      <button
                        type="button"
                        onClick={goToQuizzes}
                        className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90"
                      >
                        Go to Quizzes
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : null}
        </div>
      </div>
    </header>
  );
}
