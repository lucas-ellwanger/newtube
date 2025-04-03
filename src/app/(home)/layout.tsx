import { HomeLayout } from "@/modules/home/ui/layouts/home-layout";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <HomeLayout>{children}</HomeLayout>;
}
