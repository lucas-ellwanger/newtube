"use client";

import MuxPlayer from "@mux/mux-player-react";

import { THUMBNAIL_FALLBACK } from "@/constants";

interface VideoPlayerProps {
  playbackId?: string | null | undefined;
  thumbnailUrl?: string | null | undefined;
  autoPlay?: boolean;
  onPlay?: () => void;
}

export const VideoPlayer = ({
  playbackId,
  thumbnailUrl,
  autoPlay,
  onPlay,
}: VideoPlayerProps) => {
  return (
    <MuxPlayer
      playbackId={playbackId ?? ""}
      poster={thumbnailUrl ?? THUMBNAIL_FALLBACK}
      playerInitTime={0}
      thumbnailTime={0}
      autoPlay={autoPlay}
      onPlay={onPlay}
      className="size-full object-contain"
      accentColor="#FF2056"
    />
  );
};
