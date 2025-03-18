import Link from "next/link";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { useAuth, useClerk } from "@clerk/nextjs";
import {
  MessageSquareIcon,
  MoreVerticalIcon,
  ThumbsDownIcon,
  ThumbsUpIcon,
  Trash2Icon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { trpc } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/user-avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { type CommentsGetManyOutput } from "../../types";

interface CommentItemProps {
  comment: CommentsGetManyOutput["items"][number];
}

export const CommentItem = ({ comment }: CommentItemProps) => {
  const clerk = useClerk();
  const { userId, isLoaded } = useAuth();
  const utils = trpc.useUtils();

  const remove = trpc.comments.remove.useMutation({
    onSuccess: () => {
      utils.comments.getMany.invalidate({ videoId: comment.videoId });
      toast.success("Comment deleted");
    },
    onError: (error) => {
      if (error.data?.code === "UNAUTHORIZED") {
        clerk.openSignIn();
        toast.error("You must be signed in to comment");
      } else {
        toast.error("Something went wrong");
      }
    },
  });

  const like = trpc.commentReactions.like.useMutation({
    onSuccess: () => {
      utils.comments.getMany.invalidate({ videoId: comment.videoId });
    },
    onError: (error) => {
      if (error.data?.code === "UNAUTHORIZED") {
        clerk.openSignIn();
        toast.error("You must be signed in to like a comment");
      } else {
        toast.error("Something went wrong");
      }
    },
  });

  const dislike = trpc.commentReactions.dislike.useMutation({
    onSuccess: () => {
      utils.comments.getMany.invalidate({ videoId: comment.videoId });
    },
    onError: (error) => {
      if (error.data?.code === "UNAUTHORIZED") {
        clerk.openSignIn();
        toast.error("You must be signed in to dislike a comment");
      } else {
        toast.error("Something went wrong");
      }
    },
  });

  return (
    <div>
      <div className="flex gap-4">
        <Link href={`/users/${comment.userId}`}>
          <UserAvatar
            size="lg"
            imageUrl={comment.user.imageUrl}
            name={comment.user.name}
          />
        </Link>

        <div className="flex-1 min-w-0">
          <Link href={`/users/${comment.userId}`}>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="font-medium text-sm pb-0.5">
                {comment.user.name}
              </span>

              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(comment.createdAt, { addSuffix: true })}
              </span>
            </div>
          </Link>

          <p className="text-sm">{comment.content}</p>

          <div className="flex items-center gap-2 mt-1">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="icon"
                className="size-8 rounded-full"
                disabled={like.isPending || !isLoaded}
                onClick={() => like.mutate({ commentId: comment.id })}
              >
                <ThumbsUpIcon
                  className={cn(
                    comment.viewerReaction === "like" && "fill-black"
                  )}
                />
              </Button>

              {comment.likeCount > 0 && (
                <span className="text-xs text-muted-foreground mr-1.5">
                  {comment.likeCount}
                </span>
              )}

              <Button
                variant="ghost"
                size="icon"
                className="size-8 rounded-full"
                disabled={dislike.isPending || !isLoaded}
                onClick={() => dislike.mutate({ commentId: comment.id })}
              >
                <ThumbsDownIcon
                  className={cn(
                    comment.viewerReaction === "dislike" && "fill-black"
                  )}
                />
              </Button>

              {comment.dislikeCount > 0 && (
                <span className="text-xs text-muted-foreground">
                  {comment.dislikeCount}
                </span>
              )}
            </div>
          </div>
        </div>

        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="size-8">
              <MoreVerticalIcon />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => {}}>
              <MessageSquareIcon className="size-4" />
              Reply
            </DropdownMenuItem>

            {comment.user.clerkId === userId && (
              <DropdownMenuItem
                onClick={() => remove.mutate({ id: comment.id })}
              >
                <Trash2Icon className="size-4" />
                Delete
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};
