import Link from "next/link";
import { prisma } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

const PAGE_SIZE = 20;

type SearchParams = {
  page?: string;
  q?: string;
  role?: string;
  status?: string;
};

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const page = Math.max(Number(searchParams.page ?? "1") || 1, 1);
  const skip = (page - 1) * PAGE_SIZE;
  const q = (searchParams.q ?? "").trim();
  const role = (searchParams.role ?? "").toUpperCase();
  const status = (searchParams.status ?? "").toUpperCase();

  const where: any = {};
  if (q) {
    where.OR = [
      { email: { contains: q, mode: "insensitive" } },
      { name: { contains: q, mode: "insensitive" } },
    ];
  }
  if (role === "USER" || role === "ADMIN" || role === "SUPER_ADMIN") {
    where.role = role;
  }
  if (
    status === "ACTIVE" ||
    status === "SUSPENDED" ||
    status === "PENDING_VERIFICATION"
  ) {
    where.status = status;
  }

  const [total, users] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: PAGE_SIZE,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        createdAt: true,
      },
    }),
  ]);

  const totalPages = Math.max(Math.ceil(total / PAGE_SIZE), 1);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-text">Users</h2>
          <p className="text-sm text-muted">
            Search, filter, and inspect accounts.
          </p>
        </div>
        <form className="flex flex-wrap items-center gap-2">
          <Input
            name="q"
            placeholder="Search by email or name..."
            defaultValue={searchParams.q ?? ""}
            className="h-9 min-h-0 w-52 text-sm"
          />
          <select
            name="role"
            defaultValue={searchParams.role ?? ""}
            className="h-9 rounded-lg border-2 border-border bg-surface px-2 text-sm text-text"
          >
            <option value="">All roles</option>
            <option value="USER">User</option>
            <option value="ADMIN">Admin</option>
            <option value="SUPER_ADMIN">Super admin</option>
          </select>
          <select
            name="status"
            defaultValue={searchParams.status ?? ""}
            className="h-9 rounded-lg border-2 border-border bg-surface px-2 text-sm text-text"
          >
            <option value="">All statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="PENDING_VERIFICATION">Pending verification</option>
            <option value="SUSPENDED">Suspended</option>
          </select>
          <button
            type="submit"
            className="h-9 rounded-lg border-2 border-border bg-surface px-3 text-sm font-medium text-text hover:bg-surface-2"
          >
            Apply
          </button>
        </form>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-surface">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-border bg-surface-2 text-xs uppercase tracking-wide text-muted">
            <tr>
              <th className="px-4 py-2">Email</th>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Role</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Created</th>
              <th className="px-4 py-2" />
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td
                  className="px-4 py-4 text-sm text-muted"
                  colSpan={6}
                >
                  No users match this query.
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr
                  key={u.id}
                  className="border-t border-border hover:bg-surface-2/80"
                >
                  <td className="px-4 py-2 font-medium text-text">
                    {u.email}
                  </td>
                  <td className="px-4 py-2 text-muted">{u.name ?? "—"}</td>
                  <td className="px-4 py-2">
                    <Badge variant="outline">{u.role}</Badge>
                  </td>
                  <td className="px-4 py-2">
                    <Badge
                      variant={
                        u.status === "ACTIVE"
                          ? "success"
                          : u.status === "SUSPENDED"
                          ? "destructive"
                          : "warning"
                      }
                    >
                      {u.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-2 text-xs text-muted">
                    {new Date(u.createdAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-2 text-right">
                    <Link
                      href={`/admin/users/${u.id}`}
                      className="text-xs font-medium text-primary hover:underline"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between text-xs text-muted">
        <p>
          Showing page {page} of {totalPages} · {total} users total
        </p>
        <div className="flex items-center gap-2">
          {page > 1 && (
            <Link
              href={{
                pathname: "/admin/users",
                query: { ...searchParams, page: String(page - 1) },
              }}
              className="rounded-lg border border-border bg-surface px-2 py-1 text-xs font-medium text-text hover:bg-surface-2"
            >
              Previous
            </Link>
          )}
          {page < totalPages && (
            <Link
              href={{
                pathname: "/admin/users",
                query: { ...searchParams, page: String(page + 1) },
              }}
              className="rounded-lg border border-border bg-surface px-2 py-1 text-xs font-medium text-text hover:bg-surface-2"
            >
              Next
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

