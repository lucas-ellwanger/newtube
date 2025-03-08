import { cookies } from "next/headers";

import { SidebarProvider } from "@/components/ui/sidebar";

import { HomeNavbar } from "../components/home-navbar";
import { HomeSidebar } from "../components/home-sidebar";

interface HomeLayoutProps {
  children: React.ReactNode;
}

export const HomeLayout = async ({ children }: HomeLayoutProps) => {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true";

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <div className="w-full">
        <HomeNavbar />

        <div className="flex min-h-screen pt-[4rem]">
          <HomeSidebar />

          <main className="flex-1 overflow-y-auto">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
};
