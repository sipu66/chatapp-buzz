import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { axiosInstance } from '../../lib/axios';
import { toast } from "react-toastify";
import { connectsocket, disconnectSocket } from '../../lib/socket';

// Async thunk to fetch the current user
export const getUser = createAsyncThunk('/me', async (_, thunkAPI) => {
    try {
        const response = await axiosInstance.get('/me');
        // Connect socket after getting the user
        connectsocket(response.data.user._id); // send userId to socket
        return response.data.user;
    } catch (error) {
        console.log('Error fetching user:', error);
        return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
});

const authSlice = createSlice({
    name: 'auth',
    initialState: {
        users: [],
        authUser: null,           // currently logged in user
        isSigningUp: false,       // status for signup
        isSigningIn: false,       // status for signin
        isLoggingIn: false,       // status for login check
        isUpdatingProfile: false, // status for profile update
        isCheckingAuth: true,     // true until we know auth status
        onlineUsers: [],          // list of online users
    },
    reducers: {
        setAuthUser: (state, action) => {
            state.authUser = action.payload;
        },
        setOnlineUsers: (state, action) => {
            state.onlineUsers = action.payload;
        },
        setUsers: (state, action) => {
            state.users = action.payload;
        },
        resetAuth: (state) => {
            state.authUser = null;
            state.users = [];
            state.onlineUsers = [];
            disconnectSocket(); 
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(getUser.fulfilled, (state, action) => {
                state.authUser = action.payload;
                state.isCheckingAuth = false;
            })
            .addCase(getUser.rejected, (state, action) => {
                state.authUser = null;
                state.isCheckingAuth = false;
            })
            .addCase(getUser.pending, (state) => {
                state.isCheckingAuth = true;
            })
            .addCase(login.pending, (state) => {
                state.isLoggingIn = true;
            })
            .addCase(login.fulfilled, (state, action) => {
                state.authUser = action.payload;
                state.isLoggingIn = false;
            })
            .addCase(login.rejected, (state, action) => {
                state.isLoggingIn= false;
            })
            .addCase(updateProfile.pending, (state) => {
                state.isUpdatingProfile = true;
            })
            .addCase(updateProfile.fulfilled, (state, action) => {
                state.authUser = action.payload;
                state.isUpdatingProfile = false;
            })
            .addCase(updateProfile.rejected, (state) => {
                state.isUpdatingProfile = false;
            })
            .addCase(fetchUsers.fulfilled, (state, action) => {
                state.users = action.payload;
            })
            .addCase(fetchUsers.rejected, (state, action) => {
                state.users = [];
            });
    },
});

// Logout thunk
export const logout = createAsyncThunk('user/logout', async (_, thunkAPI) => { 
    try {
        await axiosInstance.get('/signout'); // backend clears cookie

        thunkAPI.dispatch(resetAuth()); // clear redux state
        thunkAPI.dispatch(disconnectSocket()); // disconnect socket

        return true; // indicate success
    } catch (error) {
        console.error(error);
        return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
});

// Login thunk
export const login = createAsyncThunk(
    'user/signin',
    async (data, thunkAPI) => {
        try {
            const res = await axiosInstance.post('/signin', {
                email: data.email,
                password: data.password,
            });

            connectsocket(res.data.user._id);

            return res.data.user;
        } catch (error) {
            toast.error(error.response?.data?.message || 'Invalid credentials');
            return thunkAPI.rejectWithValue(error.response?.data || error.message);
        }
    }
);

// SignUp thunk
export const signUp = createAsyncThunk(
  'user/signup',
  async (data, thunkAPI) => {
    try {
      const payload = {
        fullname: data.fullName, // must match backend field
        email: data.email,
        password: data.password,
      };

      const res = await axiosInstance.post('/signup', payload);

      thunkAPI.dispatch(authSlice.actions.setAuthUser(res.data.user));
      connectsocket(res.data.user._id);

      return res.data.user;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to sign up');
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Update profile thunk
export const updateProfile = createAsyncThunk(
    'user/updateProfile',
    async (formData, thunkAPI) => {
        try {
            const response = await axiosInstance.put('/update-profile', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            toast.success('Profile updated successfully');
            return response.data.user;
        } catch (error) {
            toast.error('Failed to update profile');
            return thunkAPI.rejectWithValue(error.response?.data || error.message);
        }
    }
);

// Fetch users thunk
export const fetchUsers = createAsyncThunk(
    'user/fetchUsers',
    async (_, thunkAPI) => {
        try {
            const res = await axiosInstance.get('/message/users'); 
            return res.data; 
        } catch (error) {
            console.error('Error fetching users:', error);
            return thunkAPI.rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const { setOnlineUsers, resetAuth, setUsers, setAuthUser } = authSlice.actions;
export default authSlice.reducer;
