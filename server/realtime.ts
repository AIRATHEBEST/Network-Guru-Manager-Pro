import { Server as HTTPServer } from "http";
import { WebSocketServer, WebSocket } from "ws";
import * as db from "./db";

interface ClientConnection {
  ws: WebSocket;
  userId: number;
  workspaceIds: Set<number>;
}

interface RealtimeMessage {
  type: string;
  data: Record<string, any>;
  timestamp: number;
}

class RealtimeManager {
  private wss: WebSocketServer;
  private clients: Map<string, ClientConnection> = new Map();
  private workspaceSubscribers: Map<number, Set<string>> = new Map();

  constructor(httpServer: HTTPServer) {
    this.wss = new WebSocketServer({ server: httpServer });
    this.setupWebSocketServer();
  }

  private setupWebSocketServer(): void {
    this.wss.on("connection", (ws: WebSocket) => {
      const clientId = this.generateClientId();
      console.log(`[RealtimeManager] Client connected: ${clientId}`);

      const client: ClientConnection = {
        ws,
        userId: 0,
        workspaceIds: new Set(),
      };

      this.clients.set(clientId, client);

      ws.on("message", (data: string) => {
        try {
          const message: RealtimeMessage = JSON.parse(data);
          this.handleMessage(clientId, message);
        } catch (error) {
          console.error("[RealtimeManager] Failed to parse message:", error);
          ws.send(
            JSON.stringify({
              type: "error",
              error: "Invalid message format",
            })
          );
        }
      });

      ws.on("close", () => {
        console.log(`[RealtimeManager] Client disconnected: ${clientId}`);
        this.removeClient(clientId);
      });

      ws.on("error", (error: Error) => {
        console.error(`[RealtimeManager] WebSocket error for ${clientId}:`, error);
      });

      // Send welcome message
      ws.send(
        JSON.stringify({
          type: "connected",
          clientId,
          timestamp: Date.now(),
        })
      );
    });
  }

  private handleMessage(clientId: string, message: RealtimeMessage): void {
    const client = this.clients.get(clientId);
    if (!client) return;

    switch (message.type) {
      case "subscribe":
        this.handleSubscribe(clientId, client, message.data);
        break;
      case "unsubscribe":
        this.handleUnsubscribe(clientId, client, message.data);
        break;
      case "ping":
        this.handlePing(clientId, client);
        break;
      default:
        console.warn(`[RealtimeManager] Unknown message type: ${message.type}`);
    }
  }

  private handleSubscribe(
    clientId: string,
    client: ClientConnection,
    data: Record<string, any>
  ): void {
    const workspaceId = data.workspaceId as number;
    if (!workspaceId) return;

    client.workspaceIds.add(workspaceId);

    if (!this.workspaceSubscribers.has(workspaceId)) {
      this.workspaceSubscribers.set(workspaceId, new Set());
    }
    this.workspaceSubscribers.get(workspaceId)!.add(clientId);

    console.log(
      `[RealtimeManager] Client ${clientId} subscribed to workspace ${workspaceId}`
    );

    // Send subscription confirmation
    client.ws.send(
      JSON.stringify({
        type: "subscribed",
        workspaceId,
        timestamp: Date.now(),
      })
    );
  }

  private handleUnsubscribe(
    clientId: string,
    client: ClientConnection,
    data: Record<string, any>
  ): void {
    const workspaceId = data.workspaceId as number;
    if (!workspaceId) return;

    client.workspaceIds.delete(workspaceId);
    this.workspaceSubscribers.get(workspaceId)?.delete(clientId);

    console.log(
      `[RealtimeManager] Client ${clientId} unsubscribed from workspace ${workspaceId}`
    );
  }

  private handlePing(clientId: string, client: ClientConnection): void {
    client.ws.send(
      JSON.stringify({
        type: "pong",
        timestamp: Date.now(),
      })
    );
  }

  private removeClient(clientId: string): void {
    const client = this.clients.get(clientId);
    if (!client) return;

    // Remove from workspace subscriptions
    client.workspaceIds.forEach((workspaceId) => {
      this.workspaceSubscribers.get(workspaceId)?.delete(clientId);
    });

    this.clients.delete(clientId);
  }

  private generateClientId(): string {
    return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Broadcast event to workspace subscribers
   */
  broadcastToWorkspace(
    workspaceId: number,
    eventType: string,
    data: Record<string, any>
  ): void {
    const subscribers = this.workspaceSubscribers.get(workspaceId);
    if (!subscribers || subscribers.size === 0) return;

    const message = JSON.stringify({
      type: eventType,
      workspaceId,
      data,
      timestamp: Date.now(),
    });

    subscribers.forEach((clientId) => {
      const client = this.clients.get(clientId);
      if (client && client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(message);
      }
    });

    console.log(
      `[RealtimeManager] Broadcast to ${subscribers.size} subscribers in workspace ${workspaceId}`
    );
  }

  /**
   * Get connected clients count
   */
  getConnectedClientsCount(): number {
    return this.clients.size;
  }

  /**
   * Get workspace subscribers count
   */
  getWorkspaceSubscribersCount(workspaceId: number): number {
    return this.workspaceSubscribers.get(workspaceId)?.size || 0;
  }
}

export let realtimeManager: RealtimeManager | null = null;

/**
 * Initialize real-time manager
 */
export function initializeRealtimeManager(httpServer: HTTPServer): RealtimeManager {
  if (!realtimeManager) {
    realtimeManager = new RealtimeManager(httpServer);
  }
  return realtimeManager;
}

/**
 * Get real-time manager instance
 */
export function getRealtimeManager(): RealtimeManager | null {
  return realtimeManager;
}

/**
 * Emit device status change event
 */
export async function emitDeviceStatusChange(
  workspaceId: number,
  deviceId: number,
  status: "online" | "offline" | "idle"
): Promise<void> {
  if (!realtimeManager) return;

  realtimeManager.broadcastToWorkspace(workspaceId, "device_status_changed", {
    deviceId,
    status,
    changedAt: new Date(),
  });

  // Log activity
  await db.logActivity({
    workspaceId,
    userId: 0, // System event
    action: "device_status_changed",
    resourceType: "device",
    resourceId: deviceId,
    details: JSON.stringify({ status }),
  });
}

/**
 * Emit alert created event
 */
export async function emitAlertCreated(
  workspaceId: number,
  alertId: number,
  severity: string,
  message: string
): Promise<void> {
  if (!realtimeManager) return;

  realtimeManager.broadcastToWorkspace(workspaceId, "alert_created", {
    alertId,
    severity,
    message,
    createdAt: new Date(),
  });

  // Log activity
  await db.logActivity({
    workspaceId,
    userId: 0, // System event
    action: "alert_created",
    resourceType: "alert",
    resourceId: alertId,
    details: JSON.stringify({ severity, message }),
  });
}

/**
 * Emit alert updated event
 */
export async function emitAlertUpdated(
  workspaceId: number,
  alertId: number,
  status: string
): Promise<void> {
  if (!realtimeManager) return;

  realtimeManager.broadcastToWorkspace(workspaceId, "alert_updated", {
    alertId,
    status,
    updatedAt: new Date(),
  });
}

/**
 * Emit network status change event
 */
export async function emitNetworkStatusChange(
  workspaceId: number,
  networkId: number,
  status: "online" | "offline" | "idle"
): Promise<void> {
  if (!realtimeManager) return;

  realtimeManager.broadcastToWorkspace(workspaceId, "network_status_changed", {
    networkId,
    status,
    changedAt: new Date(),
  });
}

/**
 * Emit agent heartbeat event
 */
export async function emitAgentHeartbeat(
  workspaceId: number,
  agentId: number,
  status: "online" | "offline" | "error"
): Promise<void> {
  if (!realtimeManager) return;

  realtimeManager.broadcastToWorkspace(workspaceId, "agent_heartbeat", {
    agentId,
    status,
    timestamp: Date.now(),
  });
}

/**
 * Emit member joined event
 */
export async function emitMemberJoined(
  workspaceId: number,
  userId: number,
  role: string
): Promise<void> {
  if (!realtimeManager) return;

  realtimeManager.broadcastToWorkspace(workspaceId, "member_joined", {
    userId,
    role,
    joinedAt: new Date(),
  });

  // Log activity
  await db.logActivity({
    workspaceId,
    userId,
    action: "member_joined",
    resourceType: "workspace",
    resourceId: workspaceId,
    details: JSON.stringify({ role }),
  });
}

/**
 * Emit member left event
 */
export async function emitMemberLeft(
  workspaceId: number,
  userId: number
): Promise<void> {
  if (!realtimeManager) return;

  realtimeManager.broadcastToWorkspace(workspaceId, "member_left", {
    userId,
    leftAt: new Date(),
  });

  // Log activity
  await db.logActivity({
    workspaceId,
    userId,
    action: "member_left",
    resourceType: "workspace",
    resourceId: workspaceId,
  });
}
