import { studioRouter } from "@/modules/studio/server/procedures";
import { videosRouter } from "@/modules/videos/server/procedures";
import { commentsRouter } from "@/modules/comments/server/procedures";
import { categoriesRouter } from "@/modules/categories/server/procedures";
import { videoViewsRouter } from "@/modules/video-views/server/procedures";
import { videoReactionsRouter } from "@/modules/video-reactions/server/procedures";
import { subscriptionsRouter } from "@/modules/subscriptions/server/procedures";
import { commentReactionsRouter } from "@/modules/comment-reactions/server/procedures";

import { createTRPCRouter } from "../init";

export const appRouter = createTRPCRouter({
  studio: studioRouter,
  videos: videosRouter,
  comments: commentsRouter,
  categories: categoriesRouter,
  videoViews: videoViewsRouter,
  videoReactions: videoReactionsRouter,
  subscriptions: subscriptionsRouter,
  commentReactions: commentReactionsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
