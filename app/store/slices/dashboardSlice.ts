import { createSlice } from "@reduxjs/toolkit";
import { Stats, ChartItem } from "@/app/types/dashboard";
import {
  fetchDashboardSummary,
  fetchDashboardChart,
} from "../thunks/dashboardThunks";

interface DashboardState {
  summary: Stats | null;
  chart: ChartItem[];
  loading: boolean;
  summaryLoading: boolean;
  chartLoading: boolean;
  error: string | null;
}

const initialState: DashboardState = {
  summary: null,
  chart: [],
  loading: false,
  summaryLoading: false,
  chartLoading: false,
  error: null,
};

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {
    clearDashboard(state) {
      state.summary = null;
      state.chart = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Summary
      .addCase(fetchDashboardSummary.pending, (state) => {
        state.summaryLoading = true;
      })
      .addCase(fetchDashboardSummary.fulfilled, (state, action) => {
        state.summaryLoading = false;
        state.summary = action.payload;
      })
      .addCase(fetchDashboardSummary.rejected, (state, action) => {
        state.summaryLoading = false;
        state.error = action.payload as string;
      })

      // Chart
      .addCase(fetchDashboardChart.pending, (state) => {
        state.chartLoading = true;
      })
      .addCase(fetchDashboardChart.fulfilled, (state, action) => {
        state.chartLoading = false;
        state.chart = action.payload;
      })
      .addCase(fetchDashboardChart.rejected, (state, action) => {
        state.chartLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearDashboard } = dashboardSlice.actions;
export default dashboardSlice.reducer;
