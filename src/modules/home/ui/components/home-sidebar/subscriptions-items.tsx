"use client";

import Link from "next/link";
import { ListIcon } from "lucide-react";
import { usePathname } from "next/navigation";

import { trpc } from "@/trpc/client";
import { Skeleton } from "@/components/ui/skeleton";
import { UserAvatar } from "@/components/user-avatar";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const LoadingSkeleton = () => {
  return (
    <>
      {Array.from({ length: 4 }).map((_, i) => (
        <SidebarMenuItem key={i}>
          <SidebarMenuButton disabled>
            <Skeleton className="size-4 rounded-full shrink-0" />
            <Skeleton className="h-4 w-full" />
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </>
  );
};

export const SubscriptionsItems = () => {
  const pathname = usePathname();

  const { data, isLoading } = trpc.subscriptions.getMany.useInfiniteQuery(
    {
      limit: 5,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Subscriptions</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {isLoading && <LoadingSkeleton />}

          {!isLoading &&
            data?.pages
              .flatMap((page) => page.items)
              .map((subscription) => (
                <SidebarMenuItem
                  key={`${subscription.creatorId}-${subscription.viewerId}`}
                >
                  <SidebarMenuButton
                    asChild
                    tooltip={subscription.user.name}
                    isActive={pathname === `/users/${subscription.user.id}`}
                  >
                    <Link
                      href={`/users/${subscription.user.id}`}
                      className="flex items-center gap-4"
                    >
                      <UserAvatar
                        size="xs"
                        imageUrl={subscription.user.imageUrl}
                        name={subscription.user.name}
                      />
                      <span className="text-sm">{subscription.user.name}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}

          {!isLoading && (
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                tooltip="All subscriptions"
                isActive={pathname === "/subscriptions"}
              >
                <Link href="/subscriptions" className="flex items-center gap-4">
                  <ListIcon className="size-4" />
                  <span className="text-sm">All subscriptions</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
};
