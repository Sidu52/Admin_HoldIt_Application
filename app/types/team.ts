
export interface InviteTeamMember {
    email: string;
    role: string;
}

export interface TeamMember {
    _id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    gender: string;
    role: string;
    date_of_birth: string;
    address: string;
    status: string;
    createdAt: Date;
    updatedAt: Date;
    is_active: boolean;
    last_login_at: Date;
    isVerified: boolean;
}


export interface TeamMemberUpdateData {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    gender: string;
    date_of_birth: string;
    address: string;
    role: string;
}

export interface UpdateTeamMemberStatus {
    status: string;
    reason: string;
    is_active: boolean;
}

export interface Pagination {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
}

export interface FilterState {
    search: string;
    status: string;
}

export interface TeamsResponse {
    team: TeamMember[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}   