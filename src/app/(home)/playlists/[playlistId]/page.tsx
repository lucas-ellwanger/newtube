import { DEFAULT_LIMIT } from "@/constants";
import { PlaylistView } from "@/modules/playlists/ui/views/playlist-view";
import { HydrateClient, trpc } from "@/trpc/server";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{
    playlistId: string;
  }>;
}

export default async function Page({ params }: PageProps) {
  const { playlistId } = await params;

  void trpc.playlists.getOne.prefetch({ playlistId });
  void trpc.playlists.getVideos.prefetchInfinite({
    playlistId,
    limit: DEFAULT_LIMIT,
  });

  return (
    <HydrateClient>
      <PlaylistView playlistId={playlistId} />
    </HydrateClient>
  );
}
