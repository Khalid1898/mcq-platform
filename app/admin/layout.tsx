import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";
import { assertAdmin } from "@/lib/auth/authorization";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const sessionUser = await getSessionUser();
  try {
    assertAdmin(sessionUser);
  } catch {
    redirect("/login");
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-80px)] max-w-6xl flex-col gap-6 px-4 py-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-text">Admin dashboard</h1>
          <p className="text-sm text-muted">
            Manage users and roles. Future: quizzes, content, analytics.
          </p>
        </div>
      </header>
      <main className="flex-1 pb-8">{children}</main>
    </div>
  );
}

