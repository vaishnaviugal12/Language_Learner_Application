// src/features/auth/authSlice.js

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosClient from './utils/axiosClient';

// =================== REGISTER ===================
export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const { data } = await axiosClient.post('/user/register', userData, { withCredentials: true });
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: 'Something went wrong' });
    }
  }
);

// =================== LOGIN ===================
export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const { data } = await axiosClient.post('/user/login', credentials, { withCredentials: true });
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: 'Something went wrong' });
    }
  }
);

// =================== LOGOUT ===================
export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await axiosClient.post('/user/logout', {}, { withCredentials: true });
      return null;
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: 'Something went wrong' });
    }
  }
);

// CHECK
export const checkAuth = createAsyncThunk(
  'auth/check',
  async (_, { rejectWithValue }) => {
    try {
      const {data} = await axiosClient.get('/user/check');
      return data.user
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);

// =================== SLICE ===================
const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    isAuthenticated: false,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // REGISTER
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        console.log("Auth state:", { isAuthenticated, user, loading });
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || action.payload?.message;
        state.isAuthenticated = false;
      })

      // LOGIN
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || action.payload?.message;
        state.isAuthenticated = false;
      })

      // LOGOUT
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.loading = false;
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || action.payload?.message;
      })

      // GET ME
      // Check
      .addCase(checkAuth.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = !!action.payload;
      })
      .addCase(checkAuth.rejected, (state, action) => {
       state.loading = false;
       state.error = action.payload?.message || "Something went wrong";
        state.isAuthenticated=false;
        state.user=null
      });
  


  },
});

export default authSlice.reducer;
