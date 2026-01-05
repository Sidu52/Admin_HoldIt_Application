import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User, FilterState, Pagination } from "@/app/types/usermanager";
import {
  fetchUsersThunk,
  fetchUserByIdThunk,
  updateUserThunk,
  createUserThunk,
  deleteUsersThunk,
  updateUserStatusThunk,
  updateMultipleUserStatusThunk,
  resetUserPasswordThunk,
} from "@/app/store/thunks/userThunks";

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
  },
  loading: true,
  error: null,
  successMessage: null,
  operationLoading: true,
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
      .addCase(fetchUsersThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsersThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.operationLoading = false;
        state.users = action.payload.users;
        state.pagination = action.payload.pagination;
        state.filters = action.payload.filters;
        state.successMessage = null;
      })
      .addCase(fetchUsersThunk.rejected, (state, action) => {
        state.loading = false;
        state.operationLoading = false;
        state.error = action.payload as string;
      });

    // Fetch User By ID
    builder
      .addCase(fetchUserByIdThunk.pending, (state) => {
        state.operationLoading = true;
        state.operationError = null;
      })
      .addCase(fetchUserByIdThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.operationLoading = false;
        state.currentUser = action.payload;
      })
      .addCase(fetchUserByIdThunk.rejected, (state, action) => {
        state.loading = false;
        state.operationLoading = false;
        state.operationError = action.payload as string;
      });

    // Update User
    builder
      .addCase(updateUserThunk.pending, (state) => {
        state.operationLoading = true;
        state.operationError = null;
        state.successMessage = null;
      })
      .addCase(updateUserThunk.fulfilled, (state, action) => {
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
      .addCase(updateUserThunk.rejected, (state, action) => {
        state.operationLoading = false;
        state.operationError = action.payload as string;
      });

    // Create User
    builder
      .addCase(createUserThunk.pending, (state) => {
        state.operationLoading = true;
        state.operationError = null;
        state.successMessage = null;
      })
      .addCase(createUserThunk.fulfilled, (state, action) => {
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
      .addCase(createUserThunk.rejected, (state, action) => {
        state.operationLoading = false;
        state.operationError = action.payload as string;
      });

    // Delete Users
    builder
      .addCase(deleteUsersThunk.pending, (state) => {
        state.operationLoading = true;
        state.operationError = null;
        state.successMessage = null;
      })
      .addCase(deleteUsersThunk.fulfilled, (state, action) => {
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
      .addCase(deleteUsersThunk.rejected, (state, action) => {
        state.operationLoading = false;
        state.operationError = action.payload as string;
      });

    // Update User Status (Single)
    builder
      .addCase(updateUserStatusThunk.pending, (state) => {
        state.operationLoading = true;
        state.operationError = null;
      })
      .addCase(updateUserStatusThunk.fulfilled, (state, action) => {
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
      .addCase(updateUserStatusThunk.rejected, (state, action) => {
        state.operationLoading = false;
        state.operationError = action.payload as string;
      });

    // Update Multiple User Status
    builder
      .addCase(updateMultipleUserStatusThunk.pending, (state) => {
        state.operationLoading = true;
        state.operationError = null;
        state.successMessage = null;
      })
      .addCase(updateMultipleUserStatusThunk.fulfilled, (state, action) => {
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
      })
      .addCase(updateMultipleUserStatusThunk.rejected, (state, action) => {
        state.operationLoading = false;
        state.operationError = action.payload as string;
      });

    // Reset User Password
    builder
      .addCase(resetUserPasswordThunk.pending, (state) => {
        state.operationLoading = true;
        state.operationError = null;
      })
      .addCase(resetUserPasswordThunk.fulfilled, (state) => {
        state.operationLoading = false;
        state.successMessage = "Password reset email sent successfully";
      })
      .addCase(resetUserPasswordThunk.rejected, (state, action) => {
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
