import { prisma } from "@/lib/db";

export default async function AdminDashboardPage() {
  const [userCount, activeCount, pendingCount, suspendedCount] =
    await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { status: "ACTIVE" } }),
      prisma.user.count({ where: { status: "PENDING_VERIFICATION" } }),
      prisma.user.count({ where: { status: "SUSPENDED" } }),
    ]);

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div className="rounded-xl border border-border bg-surface p-4">
        <p className="text-xs font-medium text-muted uppercase tracking-wide">
          Total users
        </p>
        <p className="mt-1 text-2xl font-semibold text-text">{userCount}</p>
      </div>
      <div className="rounded-xl border border-border bg-surface p-4">
        <p className="text-xs font-medium text-muted uppercase tracking-wide">
          Active
        </p>
        <p className="mt-1 text-2xl font-semibold text-text">{activeCount}</p>
      </div>
      <div className="rounded-xl border border-border bg-surface p-4">
        <p className="text-xs font-medium text-muted uppercase tracking-wide">
          Pending verification
        </p>
        <p className="mt-1 text-2xl font-semibold text-text">{pendingCount}</p>
      </div>
      <div className="rounded-xl border border-border bg-surface p-4">
        <p className="text-xs font-medium text-muted uppercase tracking-wide">
          Suspended
        </p>
        <p className="mt-1 text-2xl font-semibold text-text">
          {suspendedCount}
        </p>
      </div>
    </div>
  );
}

