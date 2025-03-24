import { HomeLayout } from "@/modules/home/ui/layouts/home-layout";

// TODO: Confirm if this is needed
export const dynamic = "force-dynamic";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <HomeLayout>{children}</HomeLayout>;
}
