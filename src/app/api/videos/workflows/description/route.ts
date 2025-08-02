import { and, eq } from "drizzle-orm";
import { serve } from "@upstash/workflow/nextjs";

import { db } from "@/db";
import { videos } from "@/db/schema";
import { deepseek } from "@/lib/deepseek";

interface InputType {
  userId: string;
  videoId: string;
}

const DESCRIPTION_SYSTEM_PROMPT = `Your task is to summarize the transcript of a video. Please follow these guidelines: 

- Be brief. Condense the content into a summary that captures the key points and main ideas without losing important details. 
- Avoid jargon or overly complex language, unless necessary for the content. 
- Focus on the most critical information, ignoring filler, repetitive statements, or irrelevant tangents. 
- ONLY return the summary, no other text, annotations, or comments. 
- Aim for a summary that is 3-5 sentences long and no more than 200 characters.`;

export const { POST } = serve(async (context) => {
  const input = context.requestPayload as InputType;
  const { userId, videoId } = input;

  const video = await context.run("get-video", async () => {
    const [existingVideo] = await db
      .select()
      .from(videos)
      .where(and(eq(videos.id, videoId), eq(videos.userId, userId)));

    if (!existingVideo) {
      throw new Error("Not found");
    }

    return existingVideo;
  });

  const transcript = await context.run("get-transcript", async () => {
    const trackUrl = `https://stream.mux.com/${video.muxPlaybackId}/text/${video.muxTrackId}.txt`;
    const response = await fetch(trackUrl);
    const text = response.text();

    if (!text) {
      throw new Error("Bad request");
    }

    return text;
  });

  const generatedDescription = await context.run(
    "generate-description",
    async () => {
      const response = await deepseek.chat.completions.create({
        model: "deepseek/deepseek-chat-v3-0324:free",
        messages: [
          {
            role: "system",
            content: DESCRIPTION_SYSTEM_PROMPT,
          },
          {
            role: "user",
            content: transcript,
          },
        ],
        temperature: 0.6,
      });

      const description = response.choices[0].message.content;

      if (!description || description === "") {
        throw new Error("Bad request");
      }

      return description;
    }
  );

  await context.run("update-video", async () => {
    await db
      .update(videos)
      .set({
        description: generatedDescription || "",
      })
      .where(and(eq(videos.id, videoId), eq(videos.userId, userId)));
  });
});
