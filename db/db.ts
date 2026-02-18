import { eq, and, or, inArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  users,
  workspaces,
  workspaceMembers,
  networks,
  devices,
  alerts,
  monitoringAgents,
  reports,
  filterTemplates,
  alertRules,
  activityLog,
  type Workspace,
  type InsertWorkspace,
  type WorkspaceMember,
  type InsertWorkspaceMember,
  type Network,
  type InsertNetwork,
  type Device,
  type InsertDevice,
  type Alert,
  type InsertAlert,
  type MonitoringAgent,
  type InsertMonitoringAgent,
  type Report,
  type InsertReport,
  type FilterTemplate,
  type InsertFilterTemplate,
  type AlertRule,
  type InsertAlertRule,
  type ActivityLog,
  type InsertActivityLog,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

/**
 * WORKSPACE QUERIES
 */

export async function createWorkspace(data: InsertWorkspace): Promise<Workspace | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    await db.insert(workspaces).values(data);
    const result = await db.select().from(workspaces).where(eq(workspaces.name, data.name)).limit(1);
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("Failed to create workspace:", error);
    return null;
  }
}

export async function getWorkspacesByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(workspaces)
    .where(
      or(
        eq(workspaces.ownerId, userId),
        inArray(
          workspaces.id,
          db
            .select({ id: workspaceMembers.workspaceId })
            .from(workspaceMembers)
            .where(eq(workspaceMembers.userId, userId))
        )
      )
    );
}

export async function getWorkspaceById(id: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select().from(workspaces).where(eq(workspaces.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function updateWorkspace(id: number, data: Partial<InsertWorkspace>) {
  const db = await getDb();
  if (!db) return null;

  await db.update(workspaces).set(data).where(eq(workspaces.id, id));
  const result = await db.select().from(workspaces).where(eq(workspaces.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

/**
 * WORKSPACE MEMBERS QUERIES
 */

export async function addWorkspaceMember(data: InsertWorkspaceMember) {
  const db = await getDb();
  if (!db) return null;

  try {
    await db.insert(workspaceMembers).values(data);
    const result = await db
      .select()
      .from(workspaceMembers)
      .where(and(eq(workspaceMembers.workspaceId, data.workspaceId), eq(workspaceMembers.userId, data.userId)))
      .limit(1);
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("Failed to add workspace member:", error);
    return null;
  }
}

export async function getWorkspaceMembers(workspaceId: number) {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(workspaceMembers).where(eq(workspaceMembers.workspaceId, workspaceId));
}

export async function updateMemberRole(memberId: number, role: "admin" | "editor" | "viewer") {
  const db = await getDb();
  if (!db) return null;

  await db.update(workspaceMembers).set({ role }).where(eq(workspaceMembers.id, memberId));
  const result = await db.select().from(workspaceMembers).where(eq(workspaceMembers.id, memberId)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function removeWorkspaceMember(memberId: number) {
  const db = await getDb();
  if (!db) return false;

  await db.delete(workspaceMembers).where(eq(workspaceMembers.id, memberId));
  return true;
}

/**
 * NETWORK QUERIES
 */

export async function createNetwork(data: InsertNetwork): Promise<Network | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    await db.insert(networks).values(data);
    const result = await db.select().from(networks).where(eq(networks.name, data.name)).limit(1);
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("Failed to create network:", error);
    return null;
  }
}

export async function getNetworksByWorkspace(workspaceId: number) {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(networks).where(eq(networks.workspaceId, workspaceId));
}

export async function getNetworkById(id: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select().from(networks).where(eq(networks.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function updateNetwork(id: number, data: Partial<InsertNetwork>) {
  const db = await getDb();
  if (!db) return null;

  await db.update(networks).set(data).where(eq(networks.id, id));
  const result = await db.select().from(networks).where(eq(networks.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

/**
 * DEVICE QUERIES
 */

export async function createDevice(data: InsertDevice): Promise<Device | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    await db.insert(devices).values(data);
    const result = await db.select().from(devices).where(eq(devices.macAddress, data.macAddress)).limit(1);
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("Failed to create device:", error);
    return null;
  }
}

export async function getDevicesByNetwork(networkId: number) {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(devices).where(eq(devices.networkId, networkId));
}

export async function getDeviceById(id: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select().from(devices).where(eq(devices.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function updateDevice(id: number, data: Partial<InsertDevice>) {
  const db = await getDb();
  if (!db) return null;

  await db.update(devices).set(data).where(eq(devices.id, id));
  const result = await db.select().from(devices).where(eq(devices.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

/**
 * ALERT QUERIES
 */

export async function createAlert(data: InsertAlert): Promise<Alert | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    await db.insert(alerts).values(data);
    const result = await db.select().from(alerts).where(eq(alerts.message, data.message)).limit(1);
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("Failed to create alert:", error);
    return null;
  }
}

export async function getAlertsByWorkspace(workspaceId: number) {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(alerts).where(eq(alerts.workspaceId, workspaceId));
}

export async function updateAlertStatus(id: number, status: string, acknowledgedAt?: Date, resolvedAt?: Date) {
  const db = await getDb();
  if (!db) return null;

  const updateData: any = { status };
  if (acknowledgedAt) updateData.acknowledgedAt = acknowledgedAt;
  if (resolvedAt) updateData.resolvedAt = resolvedAt;

  await db.update(alerts).set(updateData).where(eq(alerts.id, id));
  const result = await db.select().from(alerts).where(eq(alerts.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

/**
 * MONITORING AGENT QUERIES
 */

export async function createMonitoringAgent(data: InsertMonitoringAgent): Promise<MonitoringAgent | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    await db.insert(monitoringAgents).values(data);
    const result = await db.select().from(monitoringAgents).where(eq(monitoringAgents.name, data.name)).limit(1);
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("Failed to create monitoring agent:", error);
    return null;
  }
}

export async function getAgentsByNetwork(networkId: number) {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(monitoringAgents).where(eq(monitoringAgents.networkId, networkId));
}

export async function updateAgentStatus(id: number, status: string, lastHeartbeat?: Date) {
  const db = await getDb();
  if (!db) return null;

  const updateData: any = { status };
  if (lastHeartbeat) updateData.lastHeartbeat = lastHeartbeat;

  await db.update(monitoringAgents).set(updateData).where(eq(monitoringAgents.id, id));
  const result = await db.select().from(monitoringAgents).where(eq(monitoringAgents.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

/**
 * REPORT QUERIES
 */

export async function createReport(data: InsertReport): Promise<Report | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    await db.insert(reports).values(data);
    const result = await db.select().from(reports).where(eq(reports.title, data.title)).limit(1);
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("Failed to create report:", error);
    return null;
  }
}

export async function getReportsByWorkspace(workspaceId: number) {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(reports).where(eq(reports.workspaceId, workspaceId));
}

/**
 * FILTER TEMPLATE QUERIES
 */

export async function createFilterTemplate(data: InsertFilterTemplate): Promise<FilterTemplate | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    await db.insert(filterTemplates).values(data);
    const result = await db.select().from(filterTemplates).where(eq(filterTemplates.name, data.name)).limit(1);
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("Failed to create filter template:", error);
    return null;
  }
}

export async function getFilterTemplatesByWorkspace(workspaceId: number) {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(filterTemplates).where(eq(filterTemplates.workspaceId, workspaceId));
}

/**
 * ALERT RULE QUERIES
 */

export async function createAlertRule(data: InsertAlertRule): Promise<AlertRule | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    await db.insert(alertRules).values(data);
    const result = await db.select().from(alertRules).where(eq(alertRules.name, data.name)).limit(1);
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("Failed to create alert rule:", error);
    return null;
  }
}

export async function getAlertRulesByWorkspace(workspaceId: number) {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(alertRules).where(eq(alertRules.workspaceId, workspaceId));
}

/**
 * ACTIVITY LOG QUERIES
 */

export async function logActivity(data: InsertActivityLog): Promise<ActivityLog | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    await db.insert(activityLog).values(data);
    const result = await db.select().from(activityLog).where(eq(activityLog.action, data.action)).limit(1);
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("Failed to log activity:", error);
    return null;
  }
}

export async function getActivityLog(workspaceId: number, limit: number = 50) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(activityLog)
    .where(eq(activityLog.workspaceId, workspaceId))
    .orderBy((t) => t.createdAt)
    .limit(limit);
}
