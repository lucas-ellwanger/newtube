import { PlaylistSection } from "../sections/playlist-section";
import { PlaylistHeaderSection } from "../sections/playlist-header-section";

interface PlaylistViewProps {
  playlistId: string;
}

export const PlaylistView = ({ playlistId }: PlaylistViewProps) => {
  return (
    <div className="max-w-screen-md mx-auto mb-10 px-4 pt-2.5 flex flex-col gap-y-6">
      <PlaylistHeaderSection playlistId={playlistId} />

      <PlaylistSection playlistId={playlistId} />
    </div>
  );
};
