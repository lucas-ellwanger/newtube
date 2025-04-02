import Link from "next/link";
import { useAuth, useClerk } from "@clerk/nextjs";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { UserAvatar } from "@/components/user-avatar";
import { useSubscription } from "@/modules/subscriptions/hooks/use-subscription";
import { SubscriptionButton } from "@/modules/subscriptions/ui/components/subscription-button";

import { type UsersGetOneOutput } from "../../types";

interface UserPageInfoProps {
  user: UsersGetOneOutput;
}

// stopped here
export const UserPageInfoSkeleton = () => {
  return (
    <div className="py-6">
      {/* Mobile layout */}
      <div className="flex flex-col md:hidden">
        <div className="flex items-center gap-3">
          <Skeleton className="size-[60px] rounded-full" />
          <div className="flex-1 min-w-0">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-48 mt-1" />
          </div>
        </div>
        <Skeleton className="h-9 w-full mt-3 rounded-full" />
      </div>

      {/* Desktop layout */}
      <div className="hidden md:flex items-start gap-4">
        <Skeleton className="size-[160px] rounded-full" />
        <div className="flex-1 min-w-0">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-5 w-48 mt-4" />
          <Skeleton className="h-9 w-32 mt-3 rounded-full" />
        </div>
      </div>
    </div>
  );
};

export const UserPageInfo = ({ user }: UserPageInfoProps) => {
  const { userId, isLoaded } = useAuth();
  const clerk = useClerk();

  const { isPending, onClick } = useSubscription({
    userId: user.id,
    isSubscribed: user.viewerIsSubscribed,
  });

  return (
    <div className="py-6">
      {/* Mobile layout */}
      <div className="flex flex-col md:hidden">
        <div className="flex items-center gap-3">
          <UserAvatar
            size="lg"
            imageUrl={user.imageUrl}
            name={user.name}
            className="size-[60px] cursor-pointer"
            onClick={() => {
              if (user.clerkId === userId) {
                clerk.openUserProfile();
              }
            }}
          />

          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold">{user.name}</h1>

            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
              <span>{user.subscriberCount} subscribers</span>
              <span>&bull;</span>
              <span>{user.videoCount} videos</span>
            </div>
          </div>
        </div>

        {userId === user.clerkId ? (
          <Button
            asChild
            variant="secondary"
            className="mt-3 rounded-full w-full"
          >
            <Link href="/studio">Go to studio</Link>
          </Button>
        ) : (
          <SubscriptionButton
            disabled={isPending || !isLoaded}
            isSubscribed={user.viewerIsSubscribed}
            onClick={onClick}
            className="mt-3 w-full"
          />
        )}
      </div>

      {/* Desktop layout */}
      <div className="hidden md:flex items-start gap-4">
        <UserAvatar
          size="xl"
          imageUrl={user.imageUrl}
          name={user.name}
          className={cn(
            userId === user.clerkId &&
              "cursor-pointer hover:opacity-80 transition-opacity duration-300"
          )}
          onClick={() => {
            if (user.clerkId === userId) {
              clerk.openUserProfile();
            }
          }}
        />

        <div className="flex-1 min-w-0">
          <h1 className="text-4xl font-bold">{user.name}</h1>

          <div className="flex items-center gap-1 text-sm text-muted-foreground mt-3">
            <span>{user.subscriberCount} subscribers</span>
            <span>&bull;</span>
            <span>{user.videoCount} videos</span>
          </div>

          {userId === user.clerkId ? (
            <Button asChild variant="secondary" className="mt-3 rounded-full">
              <Link href="/studio">Go to studio</Link>
            </Button>
          ) : (
            <SubscriptionButton
              disabled={isPending || !isLoaded}
              isSubscribed={user.viewerIsSubscribed}
              onClick={onClick}
              className="mt-3"
            />
          )}
        </div>
      </div>
    </div>
  );
};
