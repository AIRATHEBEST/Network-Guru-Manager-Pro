import { useEffect, useRef, useCallback } from "react";

export type RealtimeEventType =
  | "device_status_changed"
  | "alert_created"
  | "alert_updated"
  | "network_status_changed"
  | "agent_heartbeat"
  | "member_joined"
  | "member_left";

export interface RealtimeEvent {
  type: RealtimeEventType;
  workspaceId: number;
  timestamp: number;
  data: Record<string, any>;
}

export interface RealtimeListener {
  (event: RealtimeEvent): void;
}

class RealtimeSync {
  private ws: WebSocket | null = null;
  private url: string;
  private listeners: Map<RealtimeEventType, Set<RealtimeListener>> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private isConnecting = false;
  private messageQueue: string[] = [];

  constructor(url: string) {
    this.url = url;
  }

  /**
   * Connect to WebSocket server
   */
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.isConnecting) {
        reject(new Error("Already connecting"));
        return;
      }

      this.isConnecting = true;

      try {
        // Convert HTTP/HTTPS URL to WS/WSS
        const wsUrl = this.url
          .replace(/^http:/, "ws:")
          .replace(/^https:/, "wss:");

        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
          console.log("[RealtimeSync] Connected");
          this.isConnecting = false;
          this.reconnectAttempts = 0;

          // Send queued messages
          this.flushMessageQueue();

          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const realtimeEvent: RealtimeEvent = JSON.parse(event.data);
            this.handleEvent(realtimeEvent);
          } catch (error) {
            console.error("[RealtimeSync] Failed to parse message:", error);
          }
        };

        this.ws.onerror = (error) => {
          console.error("[RealtimeSync] WebSocket error:", error);
          this.isConnecting = false;
          reject(error);
        };

        this.ws.onclose = () => {
          console.log("[RealtimeSync] Disconnected");
          this.ws = null;
          this.isConnecting = false;
          this.attemptReconnect();
        };
      } catch (error) {
        this.isConnecting = false;
        reject(error);
      }
    });
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.isConnecting = false;
  }

  /**
   * Subscribe to an event type
   */
  on(eventType: RealtimeEventType, listener: RealtimeListener): () => void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }

    this.listeners.get(eventType)!.add(listener);

    // Return unsubscribe function
    return () => {
      this.listeners.get(eventType)?.delete(listener);
    };
  }

  /**
   * Send a message to the server
   */
  send(type: string, data: Record<string, any>): void {
    const message = JSON.stringify({ type, data, timestamp: Date.now() });

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(message);
    } else {
      // Queue message for later
      this.messageQueue.push(message);
    }
  }

  /**
   * Subscribe to workspace updates
   */
  subscribeToWorkspace(workspaceId: number): void {
    this.send("subscribe", { workspaceId });
  }

  /**
   * Unsubscribe from workspace updates
   */
  unsubscribeFromWorkspace(workspaceId: number): void {
    this.send("unsubscribe", { workspaceId });
  }

  /**
   * Handle incoming event
   */
  private handleEvent(event: RealtimeEvent): void {
    const listeners = this.listeners.get(event.type);
    if (listeners) {
      listeners.forEach((listener) => {
        try {
          listener(event);
        } catch (error) {
          console.error("[RealtimeSync] Error in listener:", error);
        }
      });
    }
  }

  /**
   * Attempt to reconnect
   */
  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error("[RealtimeSync] Max reconnection attempts reached");
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

    console.log(
      `[RealtimeSync] Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`
    );

    setTimeout(() => {
      this.connect().catch((error) => {
        console.error("[RealtimeSync] Reconnection failed:", error);
      });
    }, delay);
  }

  /**
   * Flush queued messages
   */
  private flushMessageQueue(): void {
    while (this.messageQueue.length > 0 && this.ws?.readyState === WebSocket.OPEN) {
      const message = this.messageQueue.shift();
      if (message) {
        this.ws.send(message);
      }
    }
  }

  /**
   * Get connection status
   */
  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

// Singleton instance
let realtimeSyncInstance: RealtimeSync | null = null;

/**
 * Get or create RealtimeSync instance
 */
export function getRealtimeSync(url?: string): RealtimeSync {
  if (!realtimeSyncInstance) {
    const wsUrl = url || (typeof window !== "undefined" ? window.location.origin : "");
    realtimeSyncInstance = new RealtimeSync(wsUrl);
  }
  return realtimeSyncInstance;
}

/**
 * Hook to use RealtimeSync
 */
export function useRealtimeSync(workspaceId: number) {
  const syncRef = useRef(getRealtimeSync());
  const isConnectedRef = useRef(false);

  useEffect(() => {
    const sync = syncRef.current;

    // Connect if not already connected
    if (!sync.isConnected() && !isConnectedRef.current) {
      sync.connect().catch((error) => {
        console.error("[useRealtimeSync] Failed to connect:", error);
      });
      isConnectedRef.current = true;
    }

    // Subscribe to workspace
    if (sync.isConnected()) {
      sync.subscribeToWorkspace(workspaceId);
    }

    return () => {
      // Unsubscribe from workspace on unmount
      if (sync.isConnected()) {
        sync.unsubscribeFromWorkspace(workspaceId);
      }
    };
  }, [workspaceId]);

  const subscribe = useCallback(
    (eventType: RealtimeEventType, listener: RealtimeListener) => {
      return syncRef.current.on(eventType, listener);
    },
    []
  );

  return {
    subscribe,
    isConnected: syncRef.current.isConnected(),
  };
}

/**
 * Hook to listen to specific event type
 */
export function useRealtimeEvent(
  eventType: RealtimeEventType,
  callback: RealtimeListener,
  dependencies: any[] = []
) {
  const syncRef = useRef(getRealtimeSync());

  useEffect(() => {
    const unsubscribe = syncRef.current.on(eventType, callback);
    return unsubscribe;
  }, [eventType, callback, ...dependencies]);
}
