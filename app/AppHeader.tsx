"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Check } from "lucide-react";
import { useAttemptProgress } from "./AttemptProgressContext";
import { usePracticeProgress } from "./PracticeProgressContext";
import { useTheme } from "./ThemeProvider";
import { Progress } from "@/components/ui/progress";

export default function AppHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { setTheme } = useTheme();
  const { progress } = useAttemptProgress();
  const { steps: practiceSteps } = usePracticeProgress();

  const isAttemptRoute = pathname?.startsWith("/attempt/");
  const isResultPage = pathname?.includes("/result");
  const isReadingTheater = pathname === "/practice/theater";
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
      <div className="mx-auto grid max-w-4xl grid-cols-3 items-center gap-2 px-3 py-2 sm:px-4">
        <div className="flex justify-start">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-semibold text-text hover:opacity-85"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-xs font-bold text-primary dark:bg-emerald-900/60 dark:text-emerald-200">
              BP
            </span>
            <span>IELTS Practice</span>
          </Link>
        </div>

        <div className="flex justify-center">
          {progress && progress.total > 0 ? (
            <div className="flex w-full max-w-[180px] items-center gap-2">
              <span className="shrink-0 text-xs font-medium text-muted">
                {progress.current}/{progress.total}
              </span>
              <Progress
                value={(progress.current / progress.total) * 100}
                className="h-1.5 min-w-0 flex-1"
              />
            </div>
          ) : isPracticeRoute && practiceSteps.length > 0 ? (
            <nav
              aria-label="Practice session progress"
              className="flex w-full max-w-[420px] items-start justify-center overflow-x-auto pb-0.5"
            >
              <div className="flex items-stretch gap-0">
                {practiceSteps.map((step, index) => (
                  <div
                    key={`${step.skill}-${step.subtype}-${index}`}
                    className="flex min-w-0 flex-1 basis-0 flex-col items-center"
                  >
                    <div className="flex w-full items-center">
                      <div
                        className={`
                          flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 text-[10px] transition-all
                          ${step.status === "completed" ? "border-success bg-success text-primary-foreground" : ""}
                          ${step.status === "active" && step.hasSubTaskProgress ? "border-primary bg-primary/10 text-primary ring-2 ring-primary/40 ring-offset-1 ring-offset-bg" : ""}
                          ${step.status === "active" && !step.hasSubTaskProgress ? "border-border bg-surface text-muted" : ""}
                          ${step.status === "upcoming" ? "border-border bg-surface text-muted" : ""}
                        `}
                      >
                        {step.status === "completed" ? (
                          <Check className="h-3 w-3" strokeWidth={2.5} />
                        ) : (
                          <span className="font-medium">{index + 1}</span>
                        )}
                      </div>
                      {index < practiceSteps.length - 1 && (
                        <div
                          className={`mx-0.5 h-0.5 min-w-[8px] flex-1 max-w-[20px] rounded-full ${
                            step.status === "completed" ? "bg-success/70" : "bg-border"
                          }`}
                          aria-hidden
                        />
                      )}
                    </div>
                    <div className="mt-1.5 flex min-w-0 flex-col items-center text-center">
                      <span
                        className={`
                          block text-[11px] font-semibold leading-tight
                          ${step.status === "active" && step.hasSubTaskProgress ? "text-primary" : ""}
                          ${step.status === "active" && !step.hasSubTaskProgress ? "text-muted" : ""}
                          ${step.status === "upcoming" ? "text-muted" : ""}
                          ${step.status === "completed" ? "text-text" : ""}
                        `}
                      >
                        {step.skill} / {step.subtype}
                      </span>
                      <span className="mt-0.5 block text-[10px] leading-tight text-muted">
                        {step.meta}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </nav>
          ) : null}
        </div>

        <div className="flex justify-end gap-1.5">
          {isPracticeRoute ? (
            <Link
              href="/"
              className="inline-flex items-center rounded-lg border border-border bg-surface px-2.5 py-1.5 text-xs font-medium text-text hover:bg-surface-2"
            >
              Home
            </Link>
          ) : null}
          <Link
            href="/login"
            className="inline-flex items-center rounded-lg border border-border bg-surface px-2.5 py-1.5 text-xs font-medium text-text hover:bg-surface-2"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="hidden sm:inline-flex items-center rounded-lg bg-primary px-2.5 py-1.5 text-xs font-medium text-primary-foreground shadow-sm hover:bg-primary/90"
          >
            Sign up
          </Link>
          {showExitQuiz ? (
            <>
              <button
                type="button"
                onClick={() => setShowExitModal(true)}
                className="rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-medium text-text shadow-sm hover:bg-surface-2"
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
                  <div className="relative w-full max-w-md rounded-xl border border-border bg-surface p-5 shadow-lg">
                    <div className="mb-1.5 text-base font-semibold text-text">
                      Leave this attempt?
                    </div>
                    <div className="text-sm leading-relaxed text-muted">
                      Your progress is saved. You can come back later and
                      continue this attempt from the Quizzes page.
                    </div>
                    <div className="mt-4 flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setShowExitModal(false)}
                        className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-text hover:bg-surface-2"
                      >
                        Stay
                      </button>
                      <button
                        type="button"
                        onClick={goToQuizzes}
                        className="rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90"
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
