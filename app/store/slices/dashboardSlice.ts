import { createSlice } from "@reduxjs/toolkit";
import { Stats } from "@/app/types/dashboard";

type chartType =
    { day: "", value: 0, maxValue: 0 }


const initialState = {
    summary: {} as Stats,
    chart: [] as chartType[]
};

const dashboardSlice = createSlice({
    name: "chart",
    initialState,
    reducers: {
        setSummary(state, action){
            state.summary = action.payload;
        },
        setChart(state, action) {
            state.chart = action.payload;
        },
    },
});

export const { setChart,setSummary } = dashboardSlice.actions;
export default dashboardSlice.reducer;
