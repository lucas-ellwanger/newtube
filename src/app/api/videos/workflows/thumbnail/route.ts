import { and, eq } from "drizzle-orm";
import { UTApi } from "uploadthing/server";
import { serve } from "@upstash/workflow/nextjs";

import { db } from "@/db";
import { videos } from "@/db/schema";

interface InputType {
  userId: string;
  videoId: string;
  prompt: string;
}

export const { POST } = serve(async (context) => {
  const input = context.requestPayload as InputType;
  const { userId, videoId, prompt } = input;

  const video = await context.run("get-video", async () => {
    const [existingVideo] = await db
      .select()
      .from(videos)
      .where(and(eq(videos.id, videoId), eq(videos.userId, userId)))
      .limit(1);

    if (!existingVideo) {
      throw new Error("Not found");
    }

    return existingVideo;
  });

  async function generateWorkersAiImage(prompt: string) {
    const model = "@cf/stabilityai/stable-diffusion-xl-base-1.0";

    const apiURL = `https://api.cloudfare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/ai/run/${model}`;

    const response = fetch(apiURL, {
      headers: {
        Authorization: `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
      },
      method: "POST",
      body: JSON.stringify({
        prompt: prompt,
        height: 1080,
        width: 1920,
      }),
    });

    return response;
  }

  const generatedThumbnail = await context.run(
    "generate-thumbnail",
    async () => {
      const response = await generateWorkersAiImage(prompt);

      if (!response.ok) throw new Error("Failed to generate thumbnail");

      const blob = await response.blob();

      const imageFile = new File([blob], "thumbnail.png", {
        type: "image/png",
      });

      console.log(imageFile);

      // Upload thumbnail to UploadThing
      const utapi = new UTApi();
      const upload = await utapi.uploadFiles(imageFile);

      if (upload.error) {
        throw new Error(`Failed to upload image`);
      }

      // Delete old thumbnail from UploadThing
      if (video.thumbnailKey) {
        await utapi.deleteFiles(video.thumbnailKey);
      }

      return upload.data;
    }
  );

  await context.run("update-video", async () => {
    await db
      .update(videos)
      .set({
        thumbnailKey: generatedThumbnail.key,
        thumbnailUrl: generatedThumbnail.ufsUrl,
      })
      .where(and(eq(videos.id, videoId), eq(videos.userId, userId)));
  });
});
