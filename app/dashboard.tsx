import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  Pressable,
  ActivityIndicator,
  FlatList,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

interface NetworkCard {
  id: number;
  name: string;
  location?: string;
  status: "online" | "offline" | "idle";
  deviceCount: number;
  onlineCount: number;
  alertCount: number;
}

interface QuickStats {
  totalNetworks: number;
  totalDevices: number;
  onlineDevices: number;
  criticalAlerts: number;
}

export default function DashboardScreen() {
  const colors = useColors();
  const { user, isAuthenticated } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [workspaceId, setWorkspaceId] = useState<number | null>(null);
  const [networks, setNetworks] = useState<NetworkCard[]>([]);
  const [stats, setStats] = useState<QuickStats>({
    totalNetworks: 0,
    totalDevices: 0,
    onlineDevices: 0,
    criticalAlerts: 0,
  });

  // Fetch workspaces and select first one
  const workspacesQuery = trpc.workspaces.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  // Fetch networks for current workspace
  const networksQuery = trpc.networks.list.useQuery(
    { workspaceId: workspaceId! },
    { enabled: !!workspaceId }
  );

  // Fetch alerts for current workspace
  const alertsQuery = trpc.alerts.list.useQuery(
    { workspaceId: workspaceId! },
    { enabled: !!workspaceId }
  );

  // Initialize workspace
  useEffect(() => {
    if (workspacesQuery.data && workspacesQuery.data.length > 0) {
      setWorkspaceId(workspacesQuery.data[0].id);
    }
  }, [workspacesQuery.data]);

  // Update networks and stats
  useEffect(() => {
    if (networksQuery.data && alertsQuery.data) {
      const networkCards: NetworkCard[] = networksQuery.data.map((network) => ({
        id: network.id,
        name: network.name,
        location: network.location || undefined,
        status: network.status as "online" | "offline" | "idle",
        deviceCount: 0, // Will be updated with device count
        onlineCount: 0, // Will be updated with online device count
        alertCount: alertsQuery.data.filter(
          (a) => a.networkId === network.id && a.status === "new"
        ).length,
      }));

      setNetworks(networkCards);

      // Calculate stats
      const criticalAlerts = alertsQuery.data.filter(
        (a) => a.severity === "critical"
      ).length;

      setStats({
        totalNetworks: networkCards.length,
        totalDevices: 0, // Will be updated with actual device count
        onlineDevices: networkCards.filter((n) => n.status === "online").length,
        criticalAlerts,
      });
    }
  }, [networksQuery.data, alertsQuery.data]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await networksQuery.refetch();
      await alertsQuery.refetch();
    } finally {
      setRefreshing(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <ScreenContainer className="items-center justify-center">
        <Text className="text-lg text-foreground">Please log in to continue</Text>
      </ScreenContainer>
    );
  }

  if (networksQuery.isLoading) {
    return (
      <ScreenContainer className="items-center justify-center">
        <ActivityIndicator size="large" color={colors.primary} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="p-0">
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
        contentContainerStyle={{ flexGrow: 1 }}
      >
        {/* Header */}
        <View className="px-4 pt-4 pb-2">
          <Text className="text-3xl font-bold text-foreground">Dashboard</Text>
          <Text className="text-sm text-muted mt-1">
            {user?.name || "Welcome back"}
          </Text>
        </View>

        {/* Quick Stats */}
        <View className="px-4 py-4 gap-3">
          <View className="flex-row gap-3">
            {/* Networks Stat */}
            <View
              className="flex-1 rounded-xl p-4"
              style={{ backgroundColor: colors.surface }}
            >
              <Text className="text-xs text-muted font-medium">Networks</Text>
              <Text className="text-2xl font-bold text-foreground mt-1">
                {stats.totalNetworks}
              </Text>
              <Text className="text-xs text-muted mt-2">
                {stats.onlineDevices} online
              </Text>
            </View>

            {/* Devices Stat */}
            <View
              className="flex-1 rounded-xl p-4"
              style={{ backgroundColor: colors.surface }}
            >
              <Text className="text-xs text-muted font-medium">Devices</Text>
              <Text className="text-2xl font-bold text-foreground mt-1">
                {stats.totalDevices}
              </Text>
              <Text className="text-xs text-muted mt-2">
                {stats.onlineDevices} active
              </Text>
            </View>
          </View>

          <View className="flex-row gap-3">
            {/* Alerts Stat */}
            <View
              className="flex-1 rounded-xl p-4"
              style={{ backgroundColor: colors.surface }}
            >
              <Text className="text-xs text-muted font-medium">Alerts</Text>
              <Text
                className="text-2xl font-bold mt-1"
                style={{ color: stats.criticalAlerts > 0 ? colors.error : colors.success }}
              >
                {stats.criticalAlerts}
              </Text>
              <Text className="text-xs text-muted mt-2">Critical</Text>
            </View>

            {/* Status Stat */}
            <View
              className="flex-1 rounded-xl p-4"
              style={{ backgroundColor: colors.surface }}
            >
              <Text className="text-xs text-muted font-medium">Status</Text>
              <Text className="text-2xl font-bold text-success mt-1">
                {stats.totalNetworks > 0 ? "Healthy" : "—"}
              </Text>
              <Text className="text-xs text-muted mt-2">All systems</Text>
            </View>
          </View>
        </View>

        {/* Networks Section */}
        <View className="px-4 py-4">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-lg font-semibold text-foreground">Networks</Text>
            <Pressable
              className="px-3 py-1 rounded-full"
              style={{ backgroundColor: colors.primary }}
              onPress={() => {
                // Navigate to add network
              }}
            >
              <Text className="text-xs font-semibold text-background">+ Add</Text>
            </Pressable>
          </View>

          {networks.length === 0 ? (
            <View
              className="rounded-xl p-6 items-center justify-center"
              style={{ backgroundColor: colors.surface }}
            >
              <Text className="text-sm text-muted text-center">
                No networks yet. Create your first network to get started.
              </Text>
            </View>
          ) : (
            <FlatList
              data={networks}
              keyExtractor={(item) => item.id.toString()}
              scrollEnabled={false}
              renderItem={({ item }) => (
                <NetworkCard
                  network={item}
                  colors={colors}
                  onPress={() => {
                    // Navigate to network detail
                  }}
                />
              )}
              ItemSeparatorComponent={() => <View className="h-2" />}
            />
          )}
        </View>

        {/* Activity Feed Section */}
        <View className="px-4 py-4 pb-6">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-lg font-semibold text-foreground">Recent Activity</Text>
            <Pressable
              onPress={() => {
                // Navigate to activity log
              }}
            >
              <Text className="text-xs font-semibold text-primary">View All</Text>
            </Pressable>
          </View>

          <View
            className="rounded-xl p-4 gap-3"
            style={{ backgroundColor: colors.surface }}
          >
            <ActivityItem
              title="Device went offline"
              description="192.168.1.100 - Office Network"
              time="5 min ago"
              severity="warning"
              colors={colors}
            />
            <View style={{ height: 1, backgroundColor: colors.border }} />
            <ActivityItem
              title="New device discovered"
              description="Printer - Main Office"
              time="2 hours ago"
              severity="info"
              colors={colors}
            />
            <View style={{ height: 1, backgroundColor: colors.border }} />
            <ActivityItem
              title="Network sync completed"
              description="All networks updated"
              time="4 hours ago"
              severity="success"
              colors={colors}
            />
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

interface NetworkCardProps {
  network: NetworkCard;
  colors: any;
  onPress: () => void;
}

function NetworkCard({ network, colors, onPress }: NetworkCardProps) {
  const statusColor =
    network.status === "online"
      ? colors.success
      : network.status === "offline"
        ? colors.error
        : colors.warning;

  return (
    <Pressable
      onPress={onPress}
      className="rounded-xl p-4 flex-row items-center justify-between"
      style={{ backgroundColor: colors.surface }}
    >
      <View className="flex-1">
        <View className="flex-row items-center gap-2 mb-1">
          <View
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: statusColor }}
          />
          <Text className="text-base font-semibold text-foreground">{network.name}</Text>
        </View>
        {network.location && (
          <Text className="text-xs text-muted mb-2">{network.location}</Text>
        )}
        <View className="flex-row gap-4">
          <View>
            <Text className="text-xs text-muted">Devices</Text>
            <Text className="text-sm font-semibold text-foreground">
              {network.onlineCount}/{network.deviceCount}
            </Text>
          </View>
          {network.alertCount > 0 && (
            <View>
              <Text className="text-xs text-muted">Alerts</Text>
              <Text className="text-sm font-semibold text-error">
                {network.alertCount}
              </Text>
            </View>
          )}
        </View>
      </View>
      <Text className="text-2xl text-muted">›</Text>
    </Pressable>
  );
}

interface ActivityItemProps {
  title: string;
  description: string;
  time: string;
  severity: "info" | "warning" | "success" | "error";
  colors: any;
}

function ActivityItem({ title, description, time, severity, colors }: ActivityItemProps) {
  const severityColor =
    severity === "error"
      ? colors.error
      : severity === "warning"
        ? colors.warning
        : severity === "success"
          ? colors.success
          : colors.primary;

  return (
    <View className="flex-row gap-3">
      <View
        className="w-2 h-2 rounded-full mt-1"
        style={{ backgroundColor: severityColor }}
      />
      <View className="flex-1">
        <Text className="text-sm font-semibold text-foreground">{title}</Text>
        <Text className="text-xs text-muted mt-1">{description}</Text>
        <Text className="text-xs text-muted mt-1">{time}</Text>
      </View>
    </View>
  );
}
