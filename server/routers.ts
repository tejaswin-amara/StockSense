import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { getInventorySnapshot, validateDemoOperation } from "./inventory";
import { z } from "zod";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  inventory: router({
    snapshot: publicProcedure.query(() => getInventorySnapshot()),
    validateOperation: protectedProcedure
      .input(z.object({ id: z.number().int().positive() }))
      .mutation(({ input }) => validateDemoOperation(input.id)),
  }),
});

export type AppRouter = typeof appRouter;
