
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
    account_status: string;
    verification_status: string;
    createdAt: Date;
    updatedAt: Date;
    last_login_at: Date;
    account_deactivated_reason: string;
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
    verification_status: string;
}

export interface UpdateTeamMemberStatus {
    account_deactivated_reason: string;
    account_status: string;
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