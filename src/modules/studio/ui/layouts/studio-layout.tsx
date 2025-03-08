import { cookies } from "next/headers";

import { SidebarProvider } from "@/components/ui/sidebar";

import { StudioNavbar } from "../components/studio-navbar";
import { StudioSidebar } from "../components/studio-sidebar";

interface StudioLayoutProps {
  children: React.ReactNode;
}

export const StudioLayout = async ({ children }: StudioLayoutProps) => {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true";

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <div className="w-full">
        <StudioNavbar />

        <div className="flex min-h-screen pt-[4rem]">
          <StudioSidebar />

          <main className="flex-1 overflow-y-auto">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
};
