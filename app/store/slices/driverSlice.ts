// app/store/slices/driverSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { Driver, FilterState, Pagination } from "@/app/types/driver";
import {
  fetchDriversThunk,
  fetchDriverByIdThunk,
  updateDriverThunk,
  deleteDriversThunk,
  updateDriverStatusThunk,
  updateMultipleDriverStatusThunk,
} from "@/app/store/thunks/driverThunks";

// State interface
interface DriverState {
  drivers: Driver[];
  selectedDrivers: string[];
  currentDriver: Driver | null;
  pagination: Pagination;
  filters: FilterState;
  loading: boolean;
  error: string | null;
  successMessage: string | null;
  operationLoading: boolean;
  operationError: string | null;
}

// Initial state
const initialState: DriverState = {
  drivers: [],
  selectedDrivers: [],
  currentDriver: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  },
  filters: {
    search: "",
    status: "",
    vehicleType: "",
    is_online: null,
  },
  loading: true,
  error: null,
  successMessage: null,
  operationLoading: true,
  operationError: null,
};

// Create slice
const driverSlice = createSlice({
  name: "driver",
  initialState,
  reducers: {
    // Select drivers
    selectDriver: (state, action: PayloadAction<string>) => {
      if (state.selectedDrivers.includes(action.payload)) {
        state.selectedDrivers = state.selectedDrivers.filter(
          (id) => id !== action.payload
        );
      } else {
        state.selectedDrivers.push(action.payload);
      }
    },

    selectAllDrivers: (state) => {
      if (state.selectedDrivers.length === state.drivers.length) {
        state.selectedDrivers = [];
      } else {
        state.selectedDrivers = state.drivers.map((driver) => driver._id);
      }
    },

    clearSelectedDrivers: (state) => {
      state.selectedDrivers = [];
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
        vehicleType: "",
        is_online: null,
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

    // Set current driver (for editing)
    setCurrentDriver: (state, action: PayloadAction<Driver | null>) => {
      state.currentDriver = action.payload;
    },

    // Reset state
    resetDriverState: () => initialState,
  },
  extraReducers: (builder) => {
    // Fetch Drivers
    builder
      .addCase(fetchDriversThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDriversThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.operationLoading = false;
        state.drivers = action.payload.drivers;
        state.pagination = action.payload.pagination;
        state.filters = action.payload.filters;
        state.successMessage = null;
      })
      .addCase(fetchDriversThunk.rejected, (state, action) => {
        state.loading = false;
        state.operationLoading = false;
        state.error = action.payload as string;
      });

    // Fetch Driver By ID
    builder
      .addCase(fetchDriverByIdThunk.pending, (state) => {
        state.operationLoading = true;
        state.operationError = null;
      })
      .addCase(fetchDriverByIdThunk.fulfilled, (state, action) => {
        state.operationLoading = false;
        state.currentDriver = action.payload;
      })
      .addCase(fetchDriverByIdThunk.rejected, (state, action) => {
        state.operationLoading = false;
        state.operationError = action.payload as string;
      });

    // Update Driver
    builder
      .addCase(updateDriverThunk.pending, (state) => {
        state.operationLoading = true;
        state.operationError = null;
        state.successMessage = null;
      })
      .addCase(updateDriverThunk.fulfilled, (state, action) => {
        state.operationLoading = false;

        // Update in drivers list
        const index = state.drivers.findIndex(
          (d) => d._id === action.payload._id
        );
        if (index !== -1) {
          state.drivers[index] = action.payload;
        }

        // Update current driver if it's the same
        if (state.currentDriver?._id === action.payload._id) {
          state.currentDriver = action.payload;
        }

        state.successMessage = "Driver updated successfully";
      })
      .addCase(updateDriverThunk.rejected, (state, action) => {
        state.operationLoading = false;
        state.operationError = action.payload as string;
      });

    // Delete Drivers
    builder
      .addCase(deleteDriversThunk.pending, (state) => {
        state.operationLoading = true;
        state.operationError = null;
        state.successMessage = null;
      })
      .addCase(deleteDriversThunk.fulfilled, (state, action) => {
        state.operationLoading = false;

        // Remove deleted drivers from list
        state.drivers = state.drivers.filter(
          (driver) => !action.payload.includes(driver._id)
        );

        // Clear selected drivers
        state.selectedDrivers = [];

        // Update total items count
        state.pagination.totalItems -= action.payload.length;
        state.pagination.totalPages = Math.ceil(
          state.pagination.totalItems / state.pagination.itemsPerPage
        );

        state.successMessage = `${action.payload.length} driver(s) deleted successfully`;
      })
      .addCase(deleteDriversThunk.rejected, (state, action) => {
        state.operationLoading = false;
        state.operationError = action.payload as string;
      });

    // Update Driver Status (Single)
    builder
      .addCase(updateDriverStatusThunk.pending, (state) => {
        state.operationLoading = true;
        state.operationError = null;
      })
      .addCase(updateDriverStatusThunk.fulfilled, (state, action) => {
        state.operationLoading = false;

        // Update driver in list
        const index = state.drivers.findIndex(
          (d) => d._id === action.payload._id
        );
        if (index !== -1) {
          state.drivers[index] = action.payload;
        }

        // Remove from selected if it's there
        state.selectedDrivers = state.selectedDrivers.filter(
          (id) => id !== action.payload._id
        );
      })
      .addCase(updateDriverStatusThunk.rejected, (state, action) => {
        state.operationLoading = false;
        state.operationError = action.payload as string;
      });

    // Update Multiple Driver Status
    builder
      .addCase(updateMultipleDriverStatusThunk.pending, (state) => {
        state.operationLoading = true;
        state.operationError = null;
        state.successMessage = null;
      })
      .addCase(updateMultipleDriverStatusThunk.fulfilled, (state, action) => {
        state.operationLoading = false;

        // Update drivers in list
        action.payload.drivers.forEach((updatedDriver: { _id: any }) => {
          const index = state.drivers.findIndex(
            (d) => d._id === updatedDriver._id
          );
          if (index !== -1) {
            state.drivers[index] = action.payload.drivers[index];
          }
        });

        // Clear selected drivers
        state.selectedDrivers = [];

        state.successMessage = `${action.payload.ids.length} driver(s) status updated to ${action.payload.status}`;
      })
      .addCase(updateMultipleDriverStatusThunk.rejected, (state, action) => {
        state.operationLoading = false;
        state.operationError = action.payload as string;
      });
  },
});

// Export actions and reducer
export const {
  selectDriver,
  selectAllDrivers,
  clearSelectedDrivers,
  updateFilter,
  clearFilters,
  setPage,
  setItemsPerPage,
  clearError,
  clearSuccessMessage,
  setCurrentDriver,
  resetDriverState,
} = driverSlice.actions;

export default driverSlice.reducer;
