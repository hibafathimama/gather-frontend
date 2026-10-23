import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "@/lib/api";
import axios from "axios";

interface User {
_id?: string;
firstName: string;
lastName: string;
email: string;
role: "user" | "organizer" | "admin";
}

interface AuthState {
user: User | null;
token: string | null;
loading: boolean;
error: string | null;
}

const initialState: AuthState = {
user: null,
token: null,
loading: false,
error: null,
};

// Login API
export const loginUser = createAsyncThunk(
"auth/login",
async (
{ email, password }: { email: string; password: string },
{ rejectWithValue }
) => {
try {
const response = await api.post("/users/login", {
email,
password,
});


  return response.data;

} catch (error: unknown) {
  if (axios.isAxiosError(error)) {
    return rejectWithValue(
      error.response?.data?.message || "Login failed. Please try again."
    );
  }

  return rejectWithValue("Login failed. Please try again.");
}



}
);

// Auth slice
const authSlice = createSlice({
name: "auth",
initialState,

reducers: {
logout: (state) => {
state.user = null;
state.token = null;
state.error = null;
},
},

extraReducers: (builder) => {
builder
.addCase(loginUser.pending, (state) => {
state.loading = true;
state.error = null;
})

  .addCase(loginUser.fulfilled, (state, action) => {
    state.loading = false;
    state.error = null;

    // Match the actual backend response
    state.user = action.payload.data;
    state.token = action.payload.accessToken;
  })

  .addCase(loginUser.rejected, (state, action) => {
    state.loading = false;
    state.error =
      (action.payload as string) || "Login failed";
  });


},
});

export const { logout } = authSlice.actions;

export default authSlice.reducer;
