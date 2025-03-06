import { and, eq } from "drizzle-orm";
import { serve } from "@upstash/workflow/nextjs";

import { db } from "@/db";
import { videos } from "@/db/schema";

interface InputType {
  userId: string;
  videoId: string;
}

export const { POST } = serve(async (context) => {
  const input = context.requestPayload as InputType;
  const { userId, videoId } = input;

  await context.run("update-video", async () => {
    await db
      .update(videos)
      .set({
        title: "Updated from background job",
      })
      .where(and(eq(videos.id, videoId), eq(videos.userId, userId)));
  });
});
