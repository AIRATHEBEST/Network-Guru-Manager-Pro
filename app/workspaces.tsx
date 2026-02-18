import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  FlatList,
  Modal,
  TextInput,
  Alert,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

interface WorkspaceItem {
  id: number;
  name: string;
  description?: string;
  memberCount: number;
  networkCount: number;
  role: "admin" | "editor" | "viewer";
}

export default function WorkspacesScreen() {
  const colors = useColors();
  const { isAuthenticated } = useAuth();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState("");
  const [newWorkspaceDesc, setNewWorkspaceDesc] = useState("");
  const [selectedWorkspace, setSelectedWorkspace] = useState<WorkspaceItem | null>(null);
  const [showMembersModal, setShowMembersModal] = useState(false);

  // Fetch workspaces
  const workspacesQuery = trpc.workspaces.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  // Create workspace mutation
  const createWorkspaceMutation = trpc.workspaces.create.useMutation({
    onSuccess: () => {
      setNewWorkspaceName("");
      setNewWorkspaceDesc("");
      setShowCreateModal(false);
      workspacesQuery.refetch();
    },
    onError: (error) => {
      Alert.alert("Error", error.message || "Failed to create workspace");
    },
  });

  const handleCreateWorkspace = () => {
    if (!newWorkspaceName.trim()) {
      Alert.alert("Validation", "Please enter a workspace name");
      return;
    }

    createWorkspaceMutation.mutate({
      name: newWorkspaceName,
      description: newWorkspaceDesc || undefined,
    });
  };

  if (!isAuthenticated) {
    return (
      <ScreenContainer className="items-center justify-center">
        <Text className="text-lg text-foreground">Please log in to continue</Text>
      </ScreenContainer>
    );
  }

  if (workspacesQuery.isLoading) {
    return (
      <ScreenContainer className="items-center justify-center">
        <ActivityIndicator size="large" color={colors.primary} />
      </ScreenContainer>
    );
  }

  const workspaceItems: WorkspaceItem[] = (workspacesQuery.data || []).map((ws) => ({
    id: ws.id,
    name: ws.name,
    description: ws.description || undefined,
    memberCount: 1, // Will be fetched separately
    networkCount: 0, // Will be fetched separately
    role: "admin", // Will be determined from member data
  }));

  return (
    <ScreenContainer className="p-0">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        {/* Header */}
        <View className="px-4 pt-4 pb-2 flex-row items-center justify-between">
          <View>
            <Text className="text-3xl font-bold text-foreground">Workspaces</Text>
            <Text className="text-sm text-muted mt-1">Manage your team spaces</Text>
          </View>
          <Pressable
            className="px-4 py-2 rounded-full"
            style={{ backgroundColor: colors.primary }}
            onPress={() => setShowCreateModal(true)}
          >
            <Text className="text-sm font-semibold text-background">+ New</Text>
          </Pressable>
        </View>

        {/* Workspaces List */}
        <View className="px-4 py-4">
          {workspaceItems.length === 0 ? (
            <View
              className="rounded-xl p-8 items-center justify-center"
              style={{ backgroundColor: colors.surface }}
            >
              <Text className="text-base font-semibold text-foreground mb-2">
                No Workspaces Yet
              </Text>
              <Text className="text-sm text-muted text-center mb-4">
                Create your first workspace to start managing networks with your team.
              </Text>
              <Pressable
                className="px-6 py-2 rounded-full"
                style={{ backgroundColor: colors.primary }}
                onPress={() => setShowCreateModal(true)}
              >
                <Text className="text-sm font-semibold text-background">
                  Create Workspace
                </Text>
              </Pressable>
            </View>
          ) : (
            <FlatList
              data={workspaceItems}
              keyExtractor={(item) => item.id.toString()}
              scrollEnabled={false}
              renderItem={({ item }) => (
                <WorkspaceCard
                  workspace={item}
                  colors={colors}
                  onPress={() => {
                    setSelectedWorkspace(item);
                    setShowMembersModal(true);
                  }}
                />
              )}
              ItemSeparatorComponent={() => <View className="h-3" />}
            />
          )}
        </View>

        {/* Info Section */}
        <View className="px-4 py-6 pb-8">
          <View
            className="rounded-xl p-4"
            style={{ backgroundColor: colors.surface }}
          >
            <Text className="text-sm font-semibold text-foreground mb-2">
              💡 Workspace Tips
            </Text>
            <Text className="text-xs text-muted leading-relaxed">
              Create separate workspaces for different clients, projects, or office locations.
              Invite team members and assign roles to control access and permissions.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Create Workspace Modal */}
      <Modal
        visible={showCreateModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View
          className="flex-1 justify-end"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
        >
          <View
            className="rounded-t-3xl p-6 pb-8"
            style={{ backgroundColor: colors.background }}
          >
            {/* Header */}
            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-2xl font-bold text-foreground">
                Create Workspace
              </Text>
              <Pressable
                onPress={() => setShowCreateModal(false)}
                className="px-3 py-1"
              >
                <Text className="text-lg text-muted">✕</Text>
              </Pressable>
            </View>

            {/* Form */}
            <View className="gap-4 mb-6">
              {/* Name Input */}
              <View>
                <Text className="text-sm font-semibold text-foreground mb-2">
                  Workspace Name
                </Text>
                <TextInput
                  placeholder="e.g., Main Office"
                  placeholderTextColor={colors.muted}
                  value={newWorkspaceName}
                  onChangeText={setNewWorkspaceName}
                  className="px-4 py-3 rounded-lg border"
                  style={{
                    borderColor: colors.border,
                    backgroundColor: colors.surface,
                    color: colors.foreground,
                  }}
                />
              </View>

              {/* Description Input */}
              <View>
                <Text className="text-sm font-semibold text-foreground mb-2">
                  Description (Optional)
                </Text>
                <TextInput
                  placeholder="e.g., Headquarters network monitoring"
                  placeholderTextColor={colors.muted}
                  value={newWorkspaceDesc}
                  onChangeText={setNewWorkspaceDesc}
                  multiline
                  numberOfLines={3}
                  className="px-4 py-3 rounded-lg border"
                  style={{
                    borderColor: colors.border,
                    backgroundColor: colors.surface,
                    color: colors.foreground,
                    textAlignVertical: "top",
                  }}
                />
              </View>
            </View>

            {/* Buttons */}
            <View className="flex-row gap-3">
              <Pressable
                className="flex-1 py-3 rounded-lg border items-center justify-center"
                style={{ borderColor: colors.border }}
                onPress={() => setShowCreateModal(false)}
              >
                <Text className="font-semibold text-foreground">Cancel</Text>
              </Pressable>
              <Pressable
                className="flex-1 py-3 rounded-lg items-center justify-center"
                style={{ backgroundColor: colors.primary }}
                onPress={handleCreateWorkspace}
                disabled={createWorkspaceMutation.isPending}
              >
                {createWorkspaceMutation.isPending ? (
                  <ActivityIndicator color={colors.background} size="small" />
                ) : (
                  <Text className="font-semibold text-background">Create</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Members Modal */}
      {selectedWorkspace && (
        <Modal
          visible={showMembersModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowMembersModal(false)}
        >
          <WorkspaceMembersModal
            workspace={selectedWorkspace}
            colors={colors}
            onClose={() => setShowMembersModal(false)}
          />
        </Modal>
      )}
    </ScreenContainer>
  );
}

interface WorkspaceCardProps {
  workspace: WorkspaceItem;
  colors: any;
  onPress: () => void;
}

function WorkspaceCard({ workspace, colors, onPress }: WorkspaceCardProps) {
  return (
    <Pressable
      onPress={onPress}
      className="rounded-xl p-4 flex-row items-center justify-between"
      style={{ backgroundColor: colors.surface }}
    >
      <View className="flex-1">
        <Text className="text-base font-semibold text-foreground">
          {workspace.name}
        </Text>
        {workspace.description && (
          <Text className="text-sm text-muted mt-1">{workspace.description}</Text>
        )}
        <View className="flex-row gap-4 mt-3">
          <View className="flex-row items-center gap-1">
            <Text className="text-xs text-muted">👥</Text>
            <Text className="text-xs font-medium text-muted">
              {workspace.memberCount} member{workspace.memberCount !== 1 ? "s" : ""}
            </Text>
          </View>
          <View className="flex-row items-center gap-1">
            <Text className="text-xs text-muted">🌐</Text>
            <Text className="text-xs font-medium text-muted">
              {workspace.networkCount} network{workspace.networkCount !== 1 ? "s" : ""}
            </Text>
          </View>
        </View>
      </View>
      <Text className="text-2xl text-muted">›</Text>
    </Pressable>
  );
}

interface WorkspaceMembersModalProps {
  workspace: WorkspaceItem;
  colors: any;
  onClose: () => void;
}

function WorkspaceMembersModal({
  workspace,
  colors,
  onClose,
}: WorkspaceMembersModalProps) {
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [selectedRole, setSelectedRole] = useState<"admin" | "editor" | "viewer">(
    "viewer"
  );

  // Fetch workspace members
  const membersQuery = trpc.workspaceMembers.list.useQuery({
    workspaceId: workspace.id,
  });

  // Add member mutation
  const addMemberMutation = trpc.workspaceMembers.add.useMutation({
    onSuccess: () => {
      setInviteEmail("");
      setShowInviteForm(false);
      membersQuery.refetch();
    },
    onError: (error) => {
      Alert.alert("Error", error.message || "Failed to add member");
    },
  });

  const handleInviteMember = () => {
    if (!inviteEmail.trim()) {
      Alert.alert("Validation", "Please enter an email address");
      return;
    }

    // In a real app, you'd look up the user ID from email
    // For now, we'll use a placeholder
    addMemberMutation.mutate({
      workspaceId: workspace.id,
      userId: 0, // Placeholder - should be looked up
      role: selectedRole,
    });
  };

  return (
    <View
      className="flex-1 justify-end"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
    >
      <View
        className="rounded-t-3xl p-6 pb-8 max-h-3/4"
        style={{ backgroundColor: colors.background }}
      >
        {/* Header */}
        <View className="flex-row items-center justify-between mb-6">
          <View>
            <Text className="text-2xl font-bold text-foreground">
              {workspace.name}
            </Text>
            <Text className="text-sm text-muted mt-1">Team Members</Text>
          </View>
          <Pressable onPress={onClose} className="px-3 py-1">
            <Text className="text-lg text-muted">✕</Text>
          </Pressable>
        </View>

        {/* Members List */}
        <ScrollView className="mb-6 max-h-64">
          {membersQuery.isLoading ? (
            <ActivityIndicator color={colors.primary} />
          ) : membersQuery.data && membersQuery.data.length > 0 ? (
            <View className="gap-3">
              {membersQuery.data.map((member) => (
                <View
                  key={member.id}
                  className="p-3 rounded-lg flex-row items-center justify-between"
                  style={{ backgroundColor: colors.surface }}
                >
                  <View className="flex-1">
                    <Text className="text-sm font-semibold text-foreground">
                      Member #{member.userId}
                    </Text>
                    <Text className="text-xs text-muted mt-1 capitalize">
                      {member.role}
                    </Text>
                  </View>
                  <Text className="text-xs font-medium text-muted">
                    {member.role === "admin" ? "👑" : "👤"}
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <Text className="text-sm text-muted text-center py-4">
              No members yet
            </Text>
          )}
        </ScrollView>

        {/* Invite Section */}
        {!showInviteForm ? (
          <Pressable
            className="py-3 rounded-lg items-center justify-center"
            style={{ backgroundColor: colors.primary }}
            onPress={() => setShowInviteForm(true)}
          >
            <Text className="font-semibold text-background">+ Invite Member</Text>
          </Pressable>
        ) : (
          <View className="gap-3">
            {/* Email Input */}
            <View>
              <Text className="text-sm font-semibold text-foreground mb-2">
                Email Address
              </Text>
              <TextInput
                placeholder="member@example.com"
                placeholderTextColor={colors.muted}
                value={inviteEmail}
                onChangeText={setInviteEmail}
                keyboardType="email-address"
                className="px-4 py-3 rounded-lg border"
                style={{
                  borderColor: colors.border,
                  backgroundColor: colors.surface,
                  color: colors.foreground,
                }}
              />
            </View>

            {/* Role Selection */}
            <View>
              <Text className="text-sm font-semibold text-foreground mb-2">
                Role
              </Text>
              <View className="flex-row gap-2">
                {(["admin", "editor", "viewer"] as const).map((role) => (
                  <Pressable
                    key={role}
                    className="flex-1 py-2 rounded-lg items-center justify-center border"
                    style={{
                      borderColor:
                        selectedRole === role ? colors.primary : colors.border,
                      backgroundColor:
                        selectedRole === role ? colors.primary : colors.surface,
                    }}
                    onPress={() => setSelectedRole(role)}
                  >
                    <Text
                      className="text-xs font-semibold capitalize"
                      style={{
                        color:
                          selectedRole === role ? colors.background : colors.foreground,
                      }}
                    >
                      {role}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Action Buttons */}
            <View className="flex-row gap-3 mt-2">
              <Pressable
                className="flex-1 py-3 rounded-lg border items-center justify-center"
                style={{ borderColor: colors.border }}
                onPress={() => setShowInviteForm(false)}
              >
                <Text className="font-semibold text-foreground">Cancel</Text>
              </Pressable>
              <Pressable
                className="flex-1 py-3 rounded-lg items-center justify-center"
                style={{ backgroundColor: colors.primary }}
                onPress={handleInviteMember}
                disabled={addMemberMutation.isPending}
              >
                {addMemberMutation.isPending ? (
                  <ActivityIndicator color={colors.background} size="small" />
                ) : (
                  <Text className="font-semibold text-background">Invite</Text>
                )}
              </Pressable>
            </View>
          </View>
        )}
      </View>
    </View>
  );
}
