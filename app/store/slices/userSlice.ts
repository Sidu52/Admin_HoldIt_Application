// app/store/slices/userSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import {
  User,
  UserUpdateData,
  FilterState,
  Pagination,
} from "@/app/types/usermanager";
import { usersApi } from "@/app/api/client";
import { AxiosError } from "axios";

// Async Thunks
export const fetchUsers = createAsyncThunk(
  "user/fetchUsers",
  async (
    params: {
      page?: number;
      limit?: number;
      status?: string;
      search?: string;
      role?: string;
      department?: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const {
        page = 1,
        limit = 10,
        status = "",
        search = "",
        role = "",
        department = "",
      } = params;
      const response = await usersApi.getUsers(
        page,
        limit,
        status,
        search,
        role,
        department
      );

      return {
        users: response.data.users || response.data,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(response.data.total / limit),
          totalItems: response.data.total,
          itemsPerPage: limit,
        },
        filters: { status, search, role, department },
      };
    } catch (error: any) {
      const err = error as AxiosError<{ message: string }>;
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch users"
      );
    }
  }
);

export const fetchUserById = createAsyncThunk(
  "user/fetchUserById",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await usersApi.userById(id);
      return response.data;
    } catch (error: any) {
      const err = error as AxiosError<{ message: string }>;
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch user"
      );
    }
  }
);

export const updateUser = createAsyncThunk(
  "user/updateUser",
  async (data: UserUpdateData & { id: string }, { rejectWithValue }) => {
    try {
      const response = await usersApi.updateUser(data);
      return response.data;
    } catch (error: any) {
      const err = error as AxiosError<{ message: string }>;
      return rejectWithValue(
        err.response?.data?.message || "Failed to update user"
      );
    }
  }
);

export const createUser = createAsyncThunk(
  "user/createUser",
  async (data: Omit<UserUpdateData, "id">, { rejectWithValue }) => {
    try {
      const response = await usersApi.createUser(data);
      return response.data;
    } catch (error: any) {
      const err = error as AxiosError<{ message: string }>;
      return rejectWithValue(
        err.response?.data?.message || "Failed to create user"
      );
    }
  }
);

export const deleteUsers = createAsyncThunk(
  "user/deleteUsers",
  async (ids: string[], { rejectWithValue }) => {
    try {
      await usersApi.deleteUsers(ids);
      return ids;
    } catch (error: any) {
      const err = error as AxiosError<{ message: string }>;
      return rejectWithValue(
        err.response?.data?.message || "Failed to delete users"
      );
    }
  }
);

export const updateUserStatus = createAsyncThunk(
  "user/updateUserStatus",
  async (
    { id, status }: { id: string; status: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await usersApi.updateUserStatus(id, status);
      return response.data;
    } catch (error: any) {
      const err = error as AxiosError<{ message: string }>;
      return rejectWithValue(
        err.response?.data?.message || "Failed to update user status"
      );
    }
  }
);

export const updateMultipleUserStatus = createAsyncThunk(
  "user/updateMultipleUserStatus",
  async (
    { ids, status }: { ids: string[]; status: string },
    { rejectWithValue }
  ) => {
    try {
      // Update multiple users status
      const promises = ids.map((id) => usersApi.updateUserStatus(id, status));
      const responses = await Promise.all(promises);
      return { ids, status, users: responses.map((r) => r.data) };
    } catch (error: any) {
      const err = error as AxiosError<{ message: string }>;
      return rejectWithValue(
        err.response?.data?.message || "Failed to update users status"
      );
    }
  }
);

export const resetUserPassword = createAsyncThunk(
  "user/resetUserPassword",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await usersApi.resetPassword(id);
      return response.data;
    } catch (error: any) {
      const err = error as AxiosError<{ message: string }>;
      return rejectWithValue(
        err.response?.data?.message || "Failed to reset password"
      );
    }
  }
);

// State interface
interface UserState {
  users: User[];
  selectedUsers: string[];
  currentUser: User | null;
  pagination: Pagination;
  filters: FilterState;
  loading: boolean;
  error: string | null;
  successMessage: string | null;
  operationLoading: boolean;
  operationError: string | null;
}

// Initial state
const initialState: UserState = {
  users: [],
  selectedUsers: [],
  currentUser: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  },
  filters: {
    search: "",
    status: "",
    role: "",
    department: "",
  },
  loading: false,
  error: null,
  successMessage: null,
  operationLoading: false,
  operationError: null,
};

// Create slice
const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    // Select users
    selectUser: (state, action: PayloadAction<string>) => {
      if (state.selectedUsers.includes(action.payload)) {
        state.selectedUsers = state.selectedUsers.filter(
          (id) => id !== action.payload
        );
      } else {
        state.selectedUsers.push(action.payload);
      }
    },

    selectAllUsers: (state) => {
      if (state.selectedUsers.length === state.users.length) {
        state.selectedUsers = [];
      } else {
        state.selectedUsers = state.users.map((user) => user._id);
      }
    },

    clearSelectedUsers: (state) => {
      state.selectedUsers = [];
    },

    // Update filters
    updateFilter: (state, action: PayloadAction<Partial<FilterState>>) => {
      state.filters = { ...state.filters, ...action.payload };
      // Reset to first page when filters change
      state.pagination.currentPage = 1;
    },

    clearFilters: (state) => {
      state.filters = {
        search: "",
        status: "",
        role: "",
        department: "",
      };
      state.pagination.currentPage = 1;
    },

    // Update pagination
    setPage: (state, action: PayloadAction<number>) => {
      state.pagination.currentPage = action.payload;
    },

    setItemsPerPage: (state, action: PayloadAction<number>) => {
      state.pagination.itemsPerPage = action.payload;
      state.pagination.currentPage = 1; // Reset to first page
    },

    // Clear messages
    clearError: (state) => {
      state.error = null;
      state.operationError = null;
    },

    clearSuccessMessage: (state) => {
      state.successMessage = null;
    },

    // Set current user (for editing)
    setCurrentUser: (state, action: PayloadAction<User | null>) => {
      state.currentUser = action.payload;
    },

    // Reset state
    resetUserState: () => initialState,
  },
  extraReducers: (builder) => {
    // Fetch Users
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload.users;
        state.pagination = action.payload.pagination;
        state.filters = action.payload.filters;
        state.successMessage = null;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch User By ID
    builder
      .addCase(fetchUserById.pending, (state) => {
        state.operationLoading = true;
        state.operationError = null;
      })
      .addCase(fetchUserById.fulfilled, (state, action) => {
        state.operationLoading = false;
        state.currentUser = action.payload;
      })
      .addCase(fetchUserById.rejected, (state, action) => {
        state.operationLoading = false;
        state.operationError = action.payload as string;
      });

    // Update User
    builder
      .addCase(updateUser.pending, (state) => {
        state.operationLoading = true;
        state.operationError = null;
        state.successMessage = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.operationLoading = false;

        // Update in users list
        const index = state.users.findIndex(
          (u) => u._id === action.payload._id
        );
        if (index !== -1) {
          state.users[index] = action.payload;
        }

        // Update current user if it's the same
        if (state.currentUser?._id === action.payload._id) {
          state.currentUser = action.payload;
        }

        state.successMessage = "User updated successfully";
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.operationLoading = false;
        state.operationError = action.payload as string;
      });

    // Create User
    builder
      .addCase(createUser.pending, (state) => {
        state.operationLoading = true;
        state.operationError = null;
        state.successMessage = null;
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.operationLoading = false;

        // Add new user to the beginning of the list
        state.users.unshift(action.payload);

        // Update total items count
        state.pagination.totalItems += 1;
        state.pagination.totalPages = Math.ceil(
          state.pagination.totalItems / state.pagination.itemsPerPage
        );

        state.successMessage = "User created successfully";
      })
      .addCase(createUser.rejected, (state, action) => {
        state.operationLoading = false;
        state.operationError = action.payload as string;
      });

    // Delete Users
    builder
      .addCase(deleteUsers.pending, (state) => {
        state.operationLoading = true;
        state.operationError = null;
        state.successMessage = null;
      })
      .addCase(deleteUsers.fulfilled, (state, action) => {
        state.operationLoading = false;

        // Remove deleted users from list
        state.users = state.users.filter(
          (user) => !action.payload.includes(user._id)
        );

        // Clear selected users
        state.selectedUsers = [];

        // Update total items count
        state.pagination.totalItems -= action.payload.length;
        state.pagination.totalPages = Math.ceil(
          state.pagination.totalItems / state.pagination.itemsPerPage
        );

        state.successMessage = `${action.payload.length} user(s) deleted successfully`;
      })
      .addCase(deleteUsers.rejected, (state, action) => {
        state.operationLoading = false;
        state.operationError = action.payload as string;
      });

    // Update User Status (Single)
    builder
      .addCase(updateUserStatus.pending, (state) => {
        state.operationLoading = true;
        state.operationError = null;
      })
      .addCase(updateUserStatus.fulfilled, (state, action) => {
        state.operationLoading = false;

        // Update user in list
        const index = state.users.findIndex(
          (u) => u._id === action.payload._id
        );
        if (index !== -1) {
          state.users[index] = action.payload;
        }

        // Remove from selected if it's there
        state.selectedUsers = state.selectedUsers.filter(
          (id) => id !== action.payload._id
        );
      })
      .addCase(updateUserStatus.rejected, (state, action) => {
        state.operationLoading = false;
        state.operationError = action.payload as string;
      });

    // Update Multiple User Status
    builder
      .addCase(updateMultipleUserStatus.pending, (state) => {
        state.operationLoading = true;
        state.operationError = null;
        state.successMessage = null;
      })
      .addCase(updateMultipleUserStatus.fulfilled, (state, action) => {
        state.operationLoading = false;

        // Update users in list
        action.payload.users.forEach((updatedUser: { _id: string }) => {
          const index = state.users.findIndex((u) => u._id === updatedUser._id);
          if (index !== -1) {
            state.users[index] = updatedUser as User;
          }
        });

        // Clear selected users
        state.selectedUsers = [];

        state.successMessage = `${action.payload.ids.length} user(s) status updated to ${action.payload.status}`;
      })
      .addCase(updateMultipleUserStatus.rejected, (state, action) => {
        state.operationLoading = false;
        state.operationError = action.payload as string;
      });

    // Reset User Password
    builder
      .addCase(resetUserPassword.pending, (state) => {
        state.operationLoading = true;
        state.operationError = null;
      })
      .addCase(resetUserPassword.fulfilled, (state) => {
        state.operationLoading = false;
        state.successMessage = "Password reset email sent successfully";
      })
      .addCase(resetUserPassword.rejected, (state, action) => {
        state.operationLoading = false;
        state.operationError = action.payload as string;
      });
  },
});

// Export actions and reducer
export const {
  selectUser,
  selectAllUsers,
  clearSelectedUsers,
  updateFilter,
  clearFilters,
  setPage,
  setItemsPerPage,
  clearError,
  clearSuccessMessage,
  setCurrentUser,
  resetUserState,
} = userSlice.actions;

export default userSlice.reducer;
