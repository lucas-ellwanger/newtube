import { z } from "zod";
import { and, count, desc, eq, getTableColumns, lt, or } from "drizzle-orm";

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

  remove: protectedProcedure
    .input(
      z.object({
        id: z.string().cuid2(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id } = input;
      const { id: userId } = ctx.user;

      const [removedComment] = await db
        .delete(comments)
        .where(and(eq(comments.id, id), eq(comments.userId, userId)))
        .returning();

      if (!removedComment) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return removedComment;
    }),

  getMany: baseProcedure
    .input(
      z.object({
        videoId: z.string().cuid2(),
        cursor: z
          .object({
            id: z.string().cuid2(),
            updatedAt: z.date(),
          })
          .nullish(),
        limit: z.number().min(1).max(100),
      })
    )
    .query(async ({ input }) => {
      const { videoId, cursor, limit } = input;

      const totalDataPromise = db
        .select({
          count: count(),
        })
        .from(comments)
        .where(eq(comments.videoId, videoId));

      const dataPromise = db
        .select({
          ...getTableColumns(comments),
          user: users,
        })
        .from(comments)
        .where(
          and(
            eq(comments.videoId, videoId),
            cursor
              ? or(
                  lt(comments.updatedAt, cursor.updatedAt),
                  and(
                    eq(comments.updatedAt, cursor.updatedAt),
                    lt(comments.id, cursor.id)
                  )
                )
              : undefined
          )
        )
        .innerJoin(users, eq(comments.userId, users.id))
        .orderBy(desc(comments.updatedAt), desc(comments.id))
        .limit(limit + 1);

      const [totalData, data] = await Promise.all([
        totalDataPromise,
        dataPromise,
      ]);

      const hasMore = data.length > limit;
      // Remove the last item if there is more data
      const items = hasMore ? data.slice(0, -1) : data;
      // Set the next cursor to the last item if there is more data
      const lastItem = items[items.length - 1];
      const nextCursor = hasMore
        ? {
            id: lastItem.id,
            updatedAt: lastItem.updatedAt,
          }
        : null;

      return {
        totalData: totalData[0].count,
        items,
        nextCursor,
      };
    }),
});
