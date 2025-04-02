import { DEFAULT_LIMIT } from "@/constants";
import { HydrateClient, trpc } from "@/trpc/server";
import { UserView } from "@/modules/users/ui/views/user-view";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ userId: string }>;
}

export default async function Page({ params }: PageProps) {
  const { userId } = await params;

  void trpc.users.getOne.prefetch({ userId });
  void trpc.videos.getMany.prefetchInfinite({
    userId,
    limit: DEFAULT_LIMIT,
  });

  return (
    <HydrateClient>
      <UserView userId={userId} />
    </HydrateClient>
  );
}
