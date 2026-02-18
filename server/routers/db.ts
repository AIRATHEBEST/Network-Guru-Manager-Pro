export const getWorkspacesByUserId = async (userId: number) => [];
export const createWorkspace = async (data: any) => ({ id: 1, ...data });
export const getWorkspaceById = async (id: number) => null;
export const updateWorkspace = async (id: number, data: any) => ({ id, ...data });
export const getWorkspaceMembers = async (workspaceId: number) => [];
export const addWorkspaceMember = async (data: any) => ({ id: 1, ...data });
export const updateMemberRole = async (memberId: number, role: string) => ({ id: memberId, role });
