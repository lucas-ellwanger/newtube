import { DEFAULT_LIMIT } from "@/constants";
import { HydrateClient, trpc } from "@/trpc/server";
import { StudioView } from "@/modules/studio/ui/views/studio-view";

export const dynamic = "force-dynamic";

export default async function Page() {
  void trpc.studio.getMany.prefetchInfinite({
    limit: DEFAULT_LIMIT,
  });

  return (
    <HydrateClient>
      <StudioView />
    </HydrateClient>
  );
}
