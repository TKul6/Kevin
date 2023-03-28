import { IKevinValue } from '@kevin-infra/core/interfaces';
import { createAsyncThunk, createSlice, createAction } from '@reduxjs/toolkit';
import { RootState } from '../../app/store';
import { getEnvironmentKeys, setEnvironmentKey } from '../environments/environmentsApi';
import { selectEnvironment } from '../environments/environmentsSlice';


export interface EnvironmentInfoState {
    environmentKeys: Array<IKevinValue>,
    status: 'not loaded' | 'loading' | 'loaded' | 'failed' | 'no data';
    selectedEnvironmentId: string | null,
    editedKevinValue: IKevinValue | null
}

const initialState: EnvironmentInfoState = {
    status: 'not loaded',
    environmentKeys: [],
    selectedEnvironmentId: null,
    editedKevinValue: null
}


export const loadEnvironmentKeys = createAsyncThunk<Array<IKevinValue>, string>('environmentInfo/loadEnvironmentKeys',
    async (environmentId: string) => {
        return getEnvironmentKeys(environmentId);
    }
);

export interface EditValueModel {
    existingValue: IKevinValue,
    environmentId: string
    newValue: string
}

export const setKeyValue = createAsyncThunk<IKevinValue, EditValueModel>('environmentInfo/setNewValue',
    async (model: EditValueModel) => {
        return setEnvironmentKey(model.environmentId, model.existingValue.key, model.newValue);

    }
);

export const selectKeyValueForEdit = createAction<IKevinValue>('environmentInfo/selectKeyValueForEdit');

export const environmentInfoSlice = createSlice({
    name: 'environmentInfo',
    initialState,

    reducers: {

    },
    extraReducers: (builder) => {
        builder
            .addCase(loadEnvironmentKeys.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(loadEnvironmentKeys.fulfilled, (state, action) => {
                state.status = action.payload.length > 0 ? 'loaded' : 'no data';

                state.environmentKeys = action.payload;
            })
            .addCase(loadEnvironmentKeys.rejected, (state) => {
                state.status = 'failed';
            })
            .addCase(selectEnvironment, (state, action) => {
                state.selectedEnvironmentId = action.payload;
            })
            .addCase(selectKeyValueForEdit, (state, action) => {
                state.editedKevinValue = action.payload;
            })
            .addCase(setKeyValue.fulfilled, (state, action) => {
                const index = state.environmentKeys.findIndex(k => k.key === action.payload.key);
                if (index > -1) {
                    state.environmentKeys[index] = action.payload;
                }
                state.editedKevinValue = null;
            })
    },
});

export const selectEnvironmentInfo = (state: RootState) => state.environmentInfo;

export const selectEditedKevinValue = (state: RootState) => state.environmentInfo.editedKevinValue;

export default environmentInfoSlice.reducer;