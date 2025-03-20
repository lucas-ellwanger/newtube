import { toast } from "sonner";
import {
  ListPlusIcon,
  MoreVerticalIcon,
  Share2Icon,
  Trash2Icon,
} from "lucide-react";

import { APP_URL } from "@/constants";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface VideoMenuProps {
  videoId: string;
  variant?: "ghost" | "secondary";
  onRemove?: () => void;
}

// TODO: Properly implement video menu actions
export const VideoMenu = ({
  videoId,
  variant = "ghost",
  onRemove,
}: VideoMenuProps) => {
  const onShare = async () => {
    const fullUrl = `${APP_URL}/video/${videoId}`;

    await navigator.clipboard.writeText(fullUrl);
    toast.success("Link copied to the clipboard");
  };

  return (
    <DropdownMenu modal={false}>
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
