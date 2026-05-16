import { api } from "@/app/lib/axios";
import { TeamMemberUpdateData, UpdateTeamMemberStatus } from "@/app/types/team";

// Team API endpoints
const teamApi = {
  getTeamMembers: async ({
    page,
    limit,
    search,
    status,
  }: {
    page: number;
    limit: number;
    search: string;
    status: string;
  }) => {
    const res = await api.get("/admins", {
      params: { page, limit, search, status },
    });
    return res.data;
  },

  getTeamMemberById: async (id: string) => {
    const res = await api.get(`/admins/${id}`);
    return res.data;
  },

  updateTeamMember: async (data: TeamMemberUpdateData & { id: string }) => {
    const { id, ...rest } = data;
    const res = await api.put(`/admins/${id}`, rest);
    return res.data;
  },

  deleteTeamMembers: async (ids: string[]) => {
    await api.delete("/admins/bulk-delete", {
      data: { ids },
    });
  },

  updateTeamMemberStatus: async (
    data: UpdateTeamMemberStatus & { id: string }
  ) => {
    const { id, ...rest } = data;
    const res = await api.patch(`/admins/${id}/status`, { ...rest });
    return res.data;
  },
};

export default teamApi;
