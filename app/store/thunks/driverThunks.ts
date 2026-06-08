import { createAsyncThunk } from "@reduxjs/toolkit";
import driverApi from "@/app/api/driver.client";
import { DriverUpdateData } from "@/app/types/driverManager";

export const fetchDriversThunk = createAsyncThunk(
  "driver/fetchDrivers",
  async (
    params: {
      page?: number;
      limit?: number;
      status?: string;
      search?: string;
      vehicleType?: string;
      is_online?: boolean | null;
    },
    { rejectWithValue }
  ) => {
    try {
      const {
        page = 1,
        limit = 10,
        status = "",
        search = "",
        vehicleType = "",
        is_online = null,
      } = params;
      const response = await driverApi.getDrivers({page, limit, status, search});
      return {
        drivers: response.drivers,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(response.total / limit),
          totalItems: response.total,
          itemsPerPage: limit,
        },
        filters: { status, search, vehicleType, is_online },
      };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch drivers"
      );
    }
  }
);

export const fetchDriverByIdThunk = createAsyncThunk(
  "driver/fetchDriverById",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await driverApi.getDriverById(id);
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch driver"
      );
    }
  }
);

export const updateDriverThunk = createAsyncThunk(
  "driver/updateDriver",
  async (data: any, { rejectWithValue }) => {
    try {
      const response = await driverApi.updateDriver(data);
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update driver"
      );
    }
  }
);

export const deleteDriversThunk = createAsyncThunk(
  "driver/deleteDrivers",
  async (ids: string[], { rejectWithValue }) => {
    try {
      await driverApi.deleteDrivers(ids);
      return ids;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete drivers"
      );
    }
  }
);

export const updateDriverStatusThunk = createAsyncThunk(
  "driver/updateDriverStatus",
  async (
    { id, status }: { id: string; status: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await driverApi.updateDriverStatus({ id, status } as any);
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update driver status"
      );
    }
  }
);

export const updateMultipleDriverStatusThunk = createAsyncThunk(
  "driver/updateMultipleDriverStatus",
  async (
    { ids, status }: { ids: string[]; status: string },
    { rejectWithValue }
  ) => {
    try {
      // Update multiple drivers status
      const promises = ids.map((id) =>
        driverApi.updateDriverStatus({ id, status } as any)
      );
      const responses = await Promise.all(promises);
      return { ids, status, drivers: responses };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update drivers status"
      );
    }
  }
);
