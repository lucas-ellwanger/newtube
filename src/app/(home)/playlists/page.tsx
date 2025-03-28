import { DEFAULT_LIMIT } from "@/constants";
import { HydrateClient, trpc } from "@/trpc/server";
import { PlaylistsView } from "@/modules/playlists/ui/views/playlists-view";

export const dynamic = "force-dynamic";

export default async function Page() {
  void trpc.playlists.getMany.prefetchInfinite({
    limit: DEFAULT_LIMIT,
  });

  return (
    <HydrateClient>
      <PlaylistsView />
    </HydrateClient>
  );
}
