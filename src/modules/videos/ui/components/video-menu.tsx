import {
  ListPlusIcon,
  MoreVerticalIcon,
  Share2Icon,
  Trash2Icon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

interface VideoMenuProps {
  videoId: string;
  variant?: "ghost" | "secondary";
  onRemove?: () => void;
}

// TODO: Properly implement video menu actions
export const VideoMenu = ({ videoId, variant, onRemove }: VideoMenuProps) => {
  const onShare = async () => {
    // TODO: Change if deploying outside vercel
    const fullUrl = `${
      process.env.VERCEL_URL || "http://localhost:3000"
    }/video/${videoId}`;

    await navigator.clipboard.writeText(fullUrl);
    toast.success("Link copied to the clipboard");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size="icon" className="rounded-full">
          <MoreVerticalIcon />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={8}
        onClick={(e) => e.stopPropagation()}
      >
        <DropdownMenuItem onClick={onShare}>
          <Share2Icon className="size-4 mr-2" />
          Share
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => {}}>
          <ListPlusIcon className="size-4 mr-2" />
          Add to playlist
        </DropdownMenuItem>

        {onRemove && (
          <DropdownMenuItem onClick={() => {}}>
            <Trash2Icon className="size-4 mr-2" />
            Remove
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
