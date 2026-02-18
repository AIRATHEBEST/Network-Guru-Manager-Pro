import { z } from "zod";
import { COOKIE_NAME } from "../shared/const.js";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";

import * as db from "./db";
import { searchRouter } from "./searchRouter";

export const appRouter = router({
  search: searchRouter,

  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // WORKSPACE ROUTES
  workspaces: router({
    list: protectedProcedure.query(({ ctx }) => {
      return db.getWorkspacesByUserId(ctx.user.id);
    }),

    create: protectedProcedure
      .input(
        z.object({
          name: z.string().min(1).max(255),
          description: z.string().max(1000).optional(),
        })
      )
      .mutation(({ ctx, input }) => {
        return db.createWorkspace({
          name: input.name,
          description: input.description,
          ownerId: ctx.user.id,
        });
      }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(({ input }) => {
        return db.getWorkspaceById(input.id);
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          name: z.string().min(1).max(255).optional(),
          description: z.string().max(1000).optional(),
        })
      )
      .mutation(({ input }) => {
        return db.updateWorkspace(input.id, {
          name: input.name,
          description: input.description,
        });
      }),
  }),

  // WORKSPACE MEMBERS ROUTES
  workspaceMembers: router({
    list: protectedProcedure
      .input(z.object({ workspaceId: z.number() }))
      .query(({ input }) => {
        return db.getWorkspaceMembers(input.workspaceId);
      }),

    add: protectedProcedure
      .input(
        z.object({
          workspaceId: z.number(),
          userId: z.number(),
          role: z.enum(["admin", "editor", "viewer"]),
        })
      )
      .mutation(({ input }) => {
        return db.addWorkspaceMember({
          workspaceId: input.workspaceId,
          userId: input.userId,
          role: input.role,
        });
      }),

    updateRole: protectedProcedure
      .input(
        z.object({
          memberId: z.number(),
          role: z.enum(["admin", "editor", "viewer"]),
        })
      )
      .mutation(({ input }) => {
        return db.updateMemberRole(input.memberId, input.role);
      }),
  }),
});
