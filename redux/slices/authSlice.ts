import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "@/lib/api";
import axios from "axios";

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: "user" | "organizer" | "admin";
  verificationStatus?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

interface LoginResponse {
  status: boolean;
  message: string;
  data: User;
  accessToken: string;
}

const initialState: AuthState = {
  user: null,
  token: null,
  loading: false,
  error: null,
};

// Login API
export const loginUser = createAsyncThunk<
  LoginResponse,
  { email: string; password: string },
  { rejectValue: string }
>("auth/login", async ({ email, password }, { rejectWithValue }) => {
  try {
    const response = await api.post("/users/login", {
      email,
      password,
    });

    const loginData: LoginResponse = response.data;

    // Check backend response
    console.log("Backend login response:", loginData);
    console.log("Backend user ID:", loginData.data?._id);

    if (!loginData.accessToken || !loginData.data) {
      return rejectWithValue("Invalid login response from server.");
    }

    if (!loginData.data._id) {
      return rejectWithValue(
        "User ID is missing. Please check your backend login response."
      );
    }

    return loginData;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      return rejectWithValue(
        error.response?.data?.message || "Login failed. Please try again."
      );
    }

    return rejectWithValue("Login failed. Please try again.");
  }
});

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

        state.user = action.payload.data;
        state.token = action.payload.accessToken;
      })

      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload || "Login failed. Please try again.";
      });
  },
});

export const { logout } = authSlice.actions;

export default authSlice.reducer;