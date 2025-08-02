import { and, eq } from "drizzle-orm";
import { serve } from "@upstash/workflow/nextjs";

import { db } from "@/db";
import { videos } from "@/db/schema";
import { deepseek } from "@/lib/deepseek";

interface InputType {
  userId: string;
  videoId: string;
}

const TITLE_SYSTEM_PROMPT = `Your task is to generate an SEO-focused title for a YouTube video based on its transcript. Please follow these guidelines: 

- Be concise but descriptive, using relevant keywords to improve discoverability. 
- Highlight the most compelling or unique aspect of the video content. 
- Avoid jargon or overly complex language, unless it directly supports searchability. 
- Use action-oriented phrasing or clear value propositions where applicable. 
- Ensure the title is 3-8 words long and no more than 100 characters. 
- ONLY return the title as plain text. NEVER add quotes or any additional formatting.`;

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

  const generatedTitle = await context.run("generate-title", async () => {
    const response = await deepseek.chat.completions.create({
      model: "deepseek/deepseek-chat-v3-0324:free",
      messages: [
        {
          role: "system",
          content: TITLE_SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: transcript,
        },
      ],
      temperature: 0.6,
    });

    const title = response.choices[0].message.content;

    if (!title || title === "") {
      throw new Error("Bad request");
    }

    return title;
  });

  await context.run("update-video", async () => {
    await db
      .update(videos)
      .set({
        title: generatedTitle || "Untitled",
      })
      .where(and(eq(videos.id, videoId), eq(videos.userId, userId)));
  });
});
