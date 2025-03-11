import Link from "next/link";
import { useAuth } from "@clerk/nextjs";

import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/user-avatar";
import { UserInfo } from "@/modules/users/ui/components/user-info";
import { SubscriptionButton } from "@/modules/subscriptions/ui/components/subscription-button";
import { useSubscription } from "@/modules/subscriptions/hooks/use-subscription";

import { type VideoGetOneOutput } from "../../types";

interface VideoOwnerProps {
  user: VideoGetOneOutput["user"];
  videoId: string;
}

export const VideoOwner = ({ user, videoId }: VideoOwnerProps) => {
  const { userId: clerkUserId, isLoaded } = useAuth();

  const { isPending, onClick } = useSubscription({
    userId: user.id,
    isSubscribed: user.viewerIsSubscribed,
    fromVideoId: videoId,
  });

  return (
    <div className="flex items-center justify-between sm:items-center sm:justify-start gap-6 min-w-0">
      <Link href={`/users/${user.id}`}>
        <div className="flex items-center gap-2.5 min-w-0">
          <UserAvatar size="lg" imageUrl={user.imageUrl} name={user.name} />

          <div className="flex flex-col min-w-0">
            <UserInfo size="lg" name={user.name} />

            {/* TODO: Properly fill subscribers count */}
            <span className="text-sm text-muted-foreground line-clamp-1">
              {user.subscriberCount} subscribers
            </span>
          </div>
        </div>
      </Link>

      {clerkUserId === user.clerkId ? (
        <Button asChild variant="secondary" className="rounded-full">
          <Link href={`/studio/videos/${videoId}`}>Edit video</Link>
        </Button>
      ) : (
        <SubscriptionButton
          onClick={onClick}
          disabled={isPending || !isLoaded}
          isSubscribed={user.viewerIsSubscribed}
          className="flex-none"
        />
      )}
    </div>
  );
};
