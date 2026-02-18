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

    remove: protectedProcedure
      .input(z.object({ memberId: z.number() }))
      .mutation(({ input }) => {
        return db.removeWorkspaceMember(input.memberId);
      }),
  }),

  // NETWORKS ROUTES
  networks: router({
    list: protectedProcedure
      .input(z.object({ workspaceId: z.number() }))
      .query(({ input }) => {
        return db.getNetworksByWorkspace(input.workspaceId);
      }),

    create: protectedProcedure
      .input(
        z.object({
          workspaceId: z.number(),
          name: z.string().min(1).max(255),
          location: z.string().max(255).optional(),
          description: z.string().optional(),
          networkAddress: z.string().max(50).optional(),
        })
      )
      .mutation(({ input }) => {
        return db.createNetwork({
          workspaceId: input.workspaceId,
          name: input.name,
          location: input.location,
          description: input.description,
          networkAddress: input.networkAddress,
          status: "offline",
        });
      }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(({ input }) => {
        return db.getNetworkById(input.id);
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          name: z.string().min(1).max(255).optional(),
          location: z.string().max(255).optional(),
          description: z.string().optional(),
          status: z.enum(["online", "offline", "idle"]).optional(),
        })
      )
      .mutation(({ input }) => {
        return db.updateNetwork(input.id, {
          name: input.name,
          location: input.location,
          description: input.description,
          status: input.status,
          lastSyncAt: new Date(),
        });
      }),
  }),

  // DEVICES ROUTES
  devices: router({
    list: protectedProcedure
      .input(z.object({ networkId: z.number() }))
      .query(({ input }) => {
        return db.getDevicesByNetwork(input.networkId);
      }),

    create: protectedProcedure
      .input(
        z.object({
          networkId: z.number(),
          name: z.string().min(1).max(255),
          ipAddress: z.string().min(1).max(45),
          macAddress: z.string().min(1).max(17),
          deviceType: z.string().max(100).optional(),
          manufacturer: z.string().max(255).optional(),
          model: z.string().max(255).optional(),
          firmwareVersion: z.string().max(100).optional(),
        })
      )
      .mutation(({ input }) => {
        return db.createDevice({
          networkId: input.networkId,
          name: input.name,
          ipAddress: input.ipAddress,
          macAddress: input.macAddress,
          deviceType: input.deviceType,
          manufacturer: input.manufacturer,
          model: input.model,
          firmwareVersion: input.firmwareVersion,
          status: "offline",
        });
      }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(({ input }) => {
        return db.getDeviceById(input.id);
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          name: z.string().min(1).max(255).optional(),
          status: z.enum(["online", "offline", "idle"]).optional(),
          signalStrength: z.number().optional(),
          firmwareVersion: z.string().max(100).optional(),
        })
      )
      .mutation(({ input }) => {
        return db.updateDevice(input.id, {
          name: input.name,
          status: input.status,
          signalStrength: input.signalStrength,
          firmwareVersion: input.firmwareVersion,
          lastSeenAt: new Date(),
        });
      }),
  }),

  // ALERTS ROUTES
  alerts: router({
    list: protectedProcedure
      .input(z.object({ workspaceId: z.number() }))
      .query(({ input }) => {
        return db.getAlertsByWorkspace(input.workspaceId);
      }),

    create: protectedProcedure
      .input(
        z.object({
          workspaceId: z.number(),
          networkId: z.number().optional(),
          deviceId: z.number().optional(),
          type: z.string().min(1).max(100),
          severity: z.enum(["critical", "warning", "info"]),
          message: z.string().min(1),
        })
      )
      .mutation(({ input }) => {
        return db.createAlert({
          workspaceId: input.workspaceId,
          networkId: input.networkId,
          deviceId: input.deviceId,
          type: input.type,
          severity: input.severity,
          message: input.message,
          status: "new",
        });
      }),

    updateStatus: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          status: z.enum(["new", "acknowledged", "resolved"]),
        })
      )
      .mutation(({ input }) => {
        const now = input.status === "acknowledged" ? new Date() : undefined;
        const resolvedAt = input.status === "resolved" ? new Date() : undefined;
        return db.updateAlertStatus(input.id, input.status, now, resolvedAt);
      }),
  }),

  // MONITORING AGENTS ROUTES
  monitoringAgents: router({
    list: protectedProcedure
      .input(z.object({ networkId: z.number() }))
      .query(({ input }) => {
        return db.getAgentsByNetwork(input.networkId);
      }),

    create: protectedProcedure
      .input(
        z.object({
          networkId: z.number(),
          name: z.string().min(1).max(255),
          agentType: z.enum(["raspberrypi", "nas", "docker", "other"]),
          version: z.string().max(50).optional(),
        })
      )
      .mutation(({ input }) => {
        return db.createMonitoringAgent({
          networkId: input.networkId,
          name: input.name,
          agentType: input.agentType,
          status: "offline",
          version: input.version,
        });
      }),

    updateStatus: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          status: z.enum(["online", "offline", "error"]),
        })
      )
      .mutation(({ input }) => {
        return db.updateAgentStatus(input.id, input.status, new Date());
      }),
  }),

  // REPORTS ROUTES
  reports: router({
    list: protectedProcedure
      .input(z.object({ workspaceId: z.number() }))
      .query(({ input }) => {
        return db.getReportsByWorkspace(input.workspaceId);
      }),

    create: protectedProcedure
      .input(
        z.object({
          workspaceId: z.number(),
          title: z.string().min(1).max(255),
          reportType: z.enum(["performance", "security", "inventory"]),
          dateRange: z.string().max(100).optional(),
          content: z.string().optional(),
          format: z.enum(["pdf", "csv", "excel"]).default("pdf"),
        })
      )
      .mutation(({ ctx, input }) => {
        return db.createReport({
          workspaceId: input.workspaceId,
          createdBy: ctx.user.id,
          title: input.title,
          reportType: input.reportType,
          dateRange: input.dateRange,
          content: input.content,
          format: input.format,
          isScheduled: 0,
        });
      }),
  }),

  // FILTER TEMPLATES ROUTES
  filterTemplates: router({
    list: protectedProcedure
      .input(z.object({ workspaceId: z.number() }))
      .query(({ input }) => {
        return db.getFilterTemplatesByWorkspace(input.workspaceId);
      }),

    create: protectedProcedure
      .input(
        z.object({
          workspaceId: z.number(),
          name: z.string().min(1).max(255),
          description: z.string().optional(),
          filterCriteria: z.string().min(1),
          isPublic: z.boolean().default(false),
        })
      )
      .mutation(({ ctx, input }) => {
        return db.createFilterTemplate({
          workspaceId: input.workspaceId,
          createdBy: ctx.user.id,
          name: input.name,
          description: input.description,
          filterCriteria: input.filterCriteria,
          isPublic: input.isPublic ? 1 : 0,
        });
      }),
  }),

  // ALERT RULES ROUTES
  alertRules: router({
    list: protectedProcedure
      .input(z.object({ workspaceId: z.number() }))
      .query(({ input }) => {
        return db.getAlertRulesByWorkspace(input.workspaceId);
      }),

    create: protectedProcedure
      .input(
        z.object({
          workspaceId: z.number(),
          name: z.string().min(1).max(255),
          type: z.string().min(1).max(100),
          condition: z.string().min(1),
          severity: z.enum(["critical", "warning", "info"]),
        })
      )
      .mutation(({ input }) => {
        return db.createAlertRule({
          workspaceId: input.workspaceId,
          name: input.name,
          type: input.type,
          condition: input.condition,
          severity: input.severity,
          isEnabled: 1,
        });
      }),
  }),

  // ACTIVITY LOG ROUTES
  activityLog: router({
    list: protectedProcedure
      .input(z.object({ workspaceId: z.number(), limit: z.number().default(50) }))
      .query(({ input }) => {
        return db.getActivityLog(input.workspaceId, input.limit);
      }),

    log: protectedProcedure
      .input(
        z.object({
          workspaceId: z.number(),
          action: z.string().min(1).max(100),
          resourceType: z.string().max(100).optional(),
          resourceId: z.number().optional(),
          details: z.string().optional(),
        })
      )
      .mutation(({ ctx, input }) => {
        return db.logActivity({
          workspaceId: input.workspaceId,
          userId: ctx.user.id,
          action: input.action,
          resourceType: input.resourceType,
          resourceId: input.resourceId,
          details: input.details,
        });
      }),
  }),
});

export type AppRouter = typeof appRouter;

// Advanced Search Router
export const searchRouter = router({
  advancedSearch: protectedProcedure
    .input(z.object({
      query: z.string(),
      workspaceId: z.number(),
      filters: z.array(z.string()).optional(),
    }))
    .query(async ({ input }) => {
      // TODO: Implement actual search logic across networks and devices
      console.log("Backend search query:", input.query, "filters:", input.filters);
      // Mock data for now
      const mockResults = [
        { id: '101', name: 'Server Rack 1', type: 'Server', network: 'Data Center' },
        { id: '102', name: 'Wireless AP 5G', type: 'Access Point', network: 'Office Network' },
        { id: '103', name: 'IoT Camera', type: 'Camera', network: 'Security Network' },
      ];
      return mockResults.filter(result => 
        result.name.toLowerCase().includes(input.query.toLowerCase()) ||
        result.type.toLowerCase().includes(input.query.toLowerCase()) ||
        result.network.toLowerCase().includes(input.query.toLowerCase())
      );
    }),
});
