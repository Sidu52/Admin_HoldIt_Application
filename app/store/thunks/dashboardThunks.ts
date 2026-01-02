import { createAsyncThunk } from "@reduxjs/toolkit";
import { dashboardApi } from "@/app/api/client";

// Get dashboard summary
export const fetchDashboardSummary = createAsyncThunk(
  "dashboard/fetchSummary",
  async (_, { rejectWithValue }) => {
    try {
      const res = await dashboardApi.getSummary();
      return res.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || "Failed to fetch summary");
    }
  }
);

// Get dashboard chart
export const fetchDashboardChart = createAsyncThunk(
  "dashboard/fetchChart",
  async (params: { entity: string; range: string }, { rejectWithValue }) => {
    try {
      const res = await dashboardApi.getChart(params);
      return res.data.chart;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || "Failed to fetch chart");
    }
  }
);
