import { Geist, Geist_Mono } from "next/font/google";
import { SideBar } from "@/components/sidebar/sidebar";
import { MobileSidebar } from "@/components/sidebar/mobileSidebar";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { UsersService } from "@/actions/users/users.service";

export default async function UserInterfaceLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  if (!session) {
    return redirect("/signin");
  }

  const promises = Promise.all([
    UsersService.getChatsByUserId(session.user.id),
  ]);

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-100">
      <SideBar promises={promises} />
      <MobileSidebar promises={promises} />
      {children}
    </div>
  );
}
