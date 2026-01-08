import { createSlice } from "@reduxjs/toolkit";
import { clear } from "console";
interface UserState {
  users: any[];
  selectedUsers: any[];
  pagination: {
    page: number;
    limit: number;
    totalPages: number;
    totalRecords: number;
  };
  filter: {
    search: string;
    status: string;
  };
}

const initialState: UserState = {
  users: [],
  selectedUsers: [],
  pagination: {
    page: 1,
    limit: 10,
    totalPages: 1,
    totalRecords: 0,
  },
  filter: {
    search: "",
    status: "all",
  },
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    selectUser(state, action) {
      const { userId } = action.payload;
      if (state.selectedUsers.includes(userId)) {
        state.selectedUsers = state.selectedUsers.filter((u) => u !== userId);
      } else {
        state.selectedUsers = [...state.selectedUsers, userId];
      }
    },
    selectAllUsers(state) {
      state.selectedUsers = state.users.map((u) => u._id);
    },
    clearSelectedUsers(state) {
      state.selectedUsers = [];
    },
    updateFilter(state, action) {
      const { search, status } = action.payload;
      console.log("action.", action.payload);
      state.filter = { search, status };
    },
    setPage(state, action) {
      const { page } = action.payload;
      state.pagination = { ...state.pagination, page };
    },
  },
});

export const {
  selectUser,
  selectAllUsers,
  clearSelectedUsers,
  updateFilter,
  setPage,
} = userSlice.actions;
export default userSlice.reducer;
