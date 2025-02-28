import { HydrateClient, trpc } from "@/trpc/server";
import { StudioView } from "@/modules/studio/ui/view/studio-view";
import { DEFAULT_LIMIT } from "@/constants";

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
