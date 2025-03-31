import { toast } from "sonner";
import { Loader2Icon, SquareCheckIcon, SquareIcon } from "lucide-react";

import { trpc } from "@/trpc/client";
import { DEFAULT_LIMIT } from "@/constants";
import { Button } from "@/components/ui/button";
import { ResponsiveModal } from "@/components/responsive-modal";
import { InfiniteScroll } from "@/components/infinite-scroll";

interface PlaylistAddModalProps {
  videoId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const PlaylistAddModal = ({
  videoId,
  open,
  onOpenChange,
}: PlaylistAddModalProps) => {
  const utils = trpc.useUtils();

  const {
    data: playlists,
    isLoading,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = trpc.playlists.getManyForVideo.useInfiniteQuery(
    {
      videoId,
      limit: DEFAULT_LIMIT,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      enabled: !!videoId && open,
    }
  );

  const addVideo = trpc.playlists.addVideo.useMutation({
    onSuccess: () => {
      toast.success("Video added to playlist");
      utils.playlists.getMany.invalidate();
      utils.playlists.getManyForVideo.invalidate({ videoId });
      // TODO: invalidate playlists.getOne
    },
    onError: () => {
      toast.error("Something went wrong");
    },
  });

  const removeVideo = trpc.playlists.removeVideo.useMutation({
    onSuccess: () => {
      toast.success("Video removed from playlist");
      utils.playlists.getMany.invalidate();
      utils.playlists.getManyForVideo.invalidate({ videoId });
      // TODO: invalidate playlists.getOne
    },
    onError: () => {
      toast.error("Something went wrong");
    },
  });

  return (
    <ResponsiveModal
      title="Add a playlist"
      open={open}
      onOpenChange={onOpenChange}
    >
      <div className="flex flex-col gap-2">
        {isLoading && (
          <div className="flex justify-center p-4">
            <Loader2Icon className="size-5 animate-spin text-muted-foreground" />
          </div>
        )}

        {!isLoading &&
          playlists?.pages
            .flatMap((page) => page.items)
            .map((playlist) => (
              <Button
                key={playlist.id}
                variant="ghost"
                size="lg"
                className="w-full justify-start px-2 [&_svg]:size-5"
                disabled={removeVideo.isPending || addVideo.isPending}
                onClick={() => {
                  if (playlist.containsVideo) {
                    removeVideo.mutate({
                      playlistId: playlist.id,
                      videoId,
                    });
                  } else {
                    addVideo.mutate({
                      playlistId: playlist.id,
                      videoId,
                    });
                  }
                }}
              >
                {playlist.containsVideo ? (
                  <SquareCheckIcon className="mr-2" />
                ) : (
                  <SquareIcon className="mr-2" />
                )}
                {playlist.name}
              </Button>
            ))}

        {!isLoading && (
          <InfiniteScroll
            hasNextPage={hasNextPage}
            isFetchingNextPage={isFetchingNextPage}
            fetchNextPage={fetchNextPage}
            isManual
          />
        )}
      </div>
    </ResponsiveModal>
  );
};
