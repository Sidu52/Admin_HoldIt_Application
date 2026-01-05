import { createAsyncThunk } from "@reduxjs/toolkit";
import { usersApi } from "@/app/api/client";
import { UserProfile } from "@/app/types/profile";
import { AxiosError } from "axios";
import { UserUpdateData } from "@/app/types/usermanager";


// Async Thunks
export const fetchUsersThunk = createAsyncThunk(
  "user/fetchUsers",
  async (
    params: {
      page?: number;
      limit?: number;
      status?: string;
      search?: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const { page = 1, limit = 10, status = "", search = "" } = params;
      const response = await usersApi.getUsers(page, limit, status, search);

      return {
        users: response.data.users || response.data,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(response.data.total / limit),
          totalItems: response.data.total,
          itemsPerPage: limit,
        },
        filters: { status, search },
      };
    } catch (error: any) {
      const err = error as AxiosError<{ message: string }>;
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch users"
      );
    }
  }
);

export const fetchUserByIdThunk = createAsyncThunk(
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

export const updateUserThunk = createAsyncThunk(
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

export const createUserThunk = createAsyncThunk(
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

export const deleteUsersThunk = createAsyncThunk(
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

export const updateUserStatusThunk = createAsyncThunk(
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

export const updateMultipleUserStatusThunk = createAsyncThunk(
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

export const resetUserPasswordThunk = createAsyncThunk(
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
