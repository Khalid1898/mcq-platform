import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import ProfileClient from "@/components/profile/ProfileClient";

export default async function ProfilePage() {
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      emailVerifiedAt: true,
    },
  });

  if (!user) {
    redirect("/login");
  }

  return <ProfileClient user={user} />;
}

