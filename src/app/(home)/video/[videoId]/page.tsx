import { DEFAULT_LIMIT } from "@/constants";
import { HydrateClient, trpc } from "@/trpc/server";
import { VideoView } from "@/modules/videos/ui/views/video-view";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{
    videoId: string;
  }>;
}

export default async function Page({ params }: PageProps) {
  const { videoId } = await params;

  void trpc.videos.getOne.prefetch({ id: videoId });
  void trpc.comments.getMany.prefetchInfinite({
    videoId,
    limit: DEFAULT_LIMIT,
  });

  return (
    <HydrateClient>
      <VideoView videoId={videoId} />
    </HydrateClient>
  );
}
