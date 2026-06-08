export enum GENDER {
    MALE = "male",
    FEMALE = "female",
    OTHER = "other",
    PREFER_NOT_TO_SAY = "prefer_not_to_say"
}

// VERIFICATION & ONBOARDING
export enum VERIFICATION_STATUS {
    PENDING = "pending",
    VERIFIED = "verified",
    REJECTED = "rejected",
    PROFILE_COMPLETE = "profile_complete"
};

export enum ACCOUNT_STATUS {
    ACTIVE = "active",
    INACTIVE = "inactive",
    PENDING = "pending",
    BLOCKED = "blocked"
};

// Role Permission 
export const ROLES = {
    ADMIN: "admin",
    SUPER_ADMIN: "super_admin",
    OPERATION_MANAGER: "operation_manager",
    CUSTOMER_SUPPORT: "customer_support",
};
