import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  realUser: "" || null,
};

const globalState = createSlice({
  name: "globalState",
  initialState,
  reducers: {
    createUser: (state: any, { payload }: any) => {
      state.appUser = payload;
    },

    logOut: (state: any) => {
      state.appUser = null;
    },
  },
});

export const { logOut, createUser } = globalState.actions;

export default globalState.reducer;
