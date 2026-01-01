import { User } from "@/app/types/usermanager";
import { Pagination } from "@/app/types/booking";
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  users: [] as User[],
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  } as Pagination,
  userById: {} as User,
  status: "" as string,
  search: "" as string,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUsers(state, action) {
      state.users = action.payload.users;
      state.pagination = action.payload.pagination;
    },
    updateFilter(state, action) {
      const { status, search } = action.payload;
      if (status) {
        state.status = status;
      }
      if (search) {
        state.search = search;
      }
    },
    setUserById(state, action) {
      state.userById = action.payload;
    },
  },
});

export const { setUsers, updateFilter, setUserById } = userSlice.actions;
export default userSlice.reducer;
