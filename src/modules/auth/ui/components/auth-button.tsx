"use client";

import { ClapperboardIcon, UserCircleIcon } from "lucide-react";
import {
  UserButton,
  SignInButton,
  SignedIn,
  SignedOut,
  ClerkLoaded,
  ClerkLoading,
} from "@clerk/nextjs";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export const AuthButton = () => {
  return (
    <>
      <ClerkLoading>
        <Skeleton className="size-7 rounded-full" />
      </ClerkLoading>

      <ClerkLoaded>
        <SignedIn>
          <UserButton>
            <UserButton.MenuItems>
              {/* TODO: Add menu item for User Profile */}
              <UserButton.Link
                label="Studio"
                href="/studio"
                labelIcon={<ClapperboardIcon className="size-4" />}
              />

              <UserButton.Action label="manageAccount" />
            </UserButton.MenuItems>
          </UserButton>
        </SignedIn>

        <SignedOut>
          <SignInButton mode="modal">
            <Button
              variant="outline"
              className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-500 border-blue-500/20 rounded-full shadow-none"
            >
              <UserCircleIcon />
              Sign in
            </Button>
          </SignInButton>
        </SignedOut>
      </ClerkLoaded>
    </>
  );
};
