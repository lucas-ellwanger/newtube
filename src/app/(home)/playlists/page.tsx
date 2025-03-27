import { HydrateClient } from "@/trpc/server";
import { PlaylistsView } from "@/modules/playlists/ui/views/playlists-view";

export const dynamic = "force-dynamic";

export default async function Page() {
  return (
    <HydrateClient>
      <PlaylistsView />
    </HydrateClient>
  );
}
