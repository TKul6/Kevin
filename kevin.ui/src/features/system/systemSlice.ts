import { createSlice, createAction } from '@reduxjs/toolkit';
import { RootState } from '../../app/store';
import { ToastInfo } from './appToast';

export interface SystemState {
    toast: ToastInfo,
    toastOpen: boolean
}

const initialState: SystemState = {
    toast: { text: '', level: 'info' },
    toastOpen: false
};


export const openToast = createAction<ToastInfo>('environments/openToast');

export const closeToast = createAction('environments/closeToast');

export const systemSlice = createSlice({
    name: 'system',
    initialState,

    reducers: {

    },
    extraReducers: (builder) => {
        builder
            .addCase(openToast, (state, action) => {
                state.toastOpen = true;
                state.toast = action.payload;
            })
            .addCase(closeToast, (state) => {
                state.toastOpen = false;
            })
    },
});


export const selectToast = (state: RootState) => state.system.toast;
export const selectToastOpen = (state: RootState) => state.system.toastOpen;



export default systemSlice.reducer;
