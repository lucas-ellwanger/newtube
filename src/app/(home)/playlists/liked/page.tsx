import { DEFAULT_LIMIT } from "@/constants";
import { HydrateClient, trpc } from "@/trpc/server";
import { LikedView } from "@/modules/playlists/ui/views/liked-view";

export const dynamic = "force-dynamic";

export default async function Page() {
  void trpc.playlists.getLiked.prefetchInfinite({
    limit: DEFAULT_LIMIT,
  });

  return (
    <HydrateClient>
      <LikedView />
    </HydrateClient>
  );
}
