import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import UserDetailsClient from "@/components/admin/UserDetailsClient";

type Params = {
  id: string;
};

export default async function AdminUserDetailsPage({
  params,
}: {
  params: Params;
}) {
  const user = await prisma.user.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      emailVerifiedAt: true,
      lastLoginAt: true,
    },
  });

  if (!user) {
    notFound();
  }

  return <UserDetailsClient user={user} />;
}

