import {configureStore} from '@reduxjs/toolkit'
import authReducer from "@/redux/slices/authSlice";

export const store =configureStore({
    reducer:{
       auth: authReducer

    }
})

// Get the type of the entire Redux state
export type RootState = ReturnType<typeof store.getState>;

// Get the type of dispatch
export type AppDispatch = typeof store.dispatch;


