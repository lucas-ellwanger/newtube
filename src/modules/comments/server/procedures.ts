import { z } from "zod";
import { eq, getTableColumns } from "drizzle-orm";

import { db } from "@/db";
import { comments, users } from "@/db/schema";
import { TRPCError } from "@trpc/server";
import {
  baseProcedure,
  createTRPCRouter,
  protectedProcedure,
} from "@/trpc/init";

export const commentsRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        videoId: z.string().cuid2(),
        content: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { videoId, content } = input;
      const { id: userId } = ctx.user;

      if (!userId) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      if (!videoId || !content) {
        throw new TRPCError({ code: "BAD_REQUEST" });
      }

      const [createdComment] = await db
        .insert(comments)
        .values({
          userId,
          videoId,
          content,
        })
        .returning();

      return createdComment;
    }),

  getMany: baseProcedure
    .input(z.object({ videoId: z.string().cuid2() }))
    .query(async ({ input }) => {
      const { videoId } = input;

      const videoComments = await db
        .select({
          ...getTableColumns(comments),
          user: users,
        })
        .from(comments)
        .where(eq(comments.videoId, videoId))
        .innerJoin(users, eq(comments.userId, users.id));

      return videoComments;
    }),
});
