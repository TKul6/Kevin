import { IKevinValue } from '@kevin-infra/core/interfaces';
import { createSlice, } from '@reduxjs/toolkit';
import { DialogState } from '../../../app/helpers/dialog-helpers';
import { LoadingStatus } from '../../../app/types';
import { selectEnvironment } from '../../environments/environmentsSlice';
import * as actions from './environment-info.actions';

/* #region state */
export interface EnvironmentInfoState {
    environmentKeys: Array<IKevinValue>,
    status: LoadingStatus;
    selectedEnvironmentId: string | null,
    editedKevinValue: IKevinValue | null
    addKeyStatus: DialogState
    inheritKeyStatus: DialogState,
    keyToInherit: IKevinValue | null,
    getParentKeyStatus: LoadingStatus
    parentKey: IKevinValue | null

}

const initialState: EnvironmentInfoState = {
    status: LoadingStatus.NotLoaded,
    environmentKeys: [],
    selectedEnvironmentId: null,
    editedKevinValue: null,
    addKeyStatus: "idle",
    inheritKeyStatus: "idle",
    keyToInherit: null,
    getParentKeyStatus: LoadingStatus.NotLoaded,
    parentKey: null

}

/* #endregion */




export const environmentInfoSlice = createSlice({
    name: 'environmentInfo',
    initialState,

    reducers: {

    },
    extraReducers: (builder) => {
        builder
            .addCase(actions.loadEnvironmentKeys.pending, (state) => {
                state.status = LoadingStatus.Loading;
            })
            .addCase(actions.loadEnvironmentKeys.fulfilled, (state, action) => {
                state.status = action.payload.length > 0 ? LoadingStatus.Loaded : LoadingStatus.NoData;

                state.environmentKeys = action.payload;
            })
            .addCase(actions.loadEnvironmentKeys.rejected, (state) => {
                state.status = LoadingStatus.Failed;
            })
            .addCase(selectEnvironment, (state, action) => {
                state.selectedEnvironmentId = action.payload;
            })
            .addCase(actions.selectKeyValueForEdit, (state, action) => {
                state.editedKevinValue = action.payload;
            })
            .addCase(actions.openSetKeyValueDialog, (state, action) => {
                state.editedKevinValue = action.payload;
            }).addCase(actions.closeSetValueDialog, (state, _) => {
                state.editedKevinValue = null;
            })
            .addCase(actions.setKeyValue.fulfilled, (state, action) => {
                const index = state.environmentKeys.findIndex(k => k.key === action.payload.key);
                if (index > -1) {
                    state.environmentKeys[index] = action.payload;
                }
                state.editedKevinValue = null;
            }).addCase(actions.openAddKeyDialog, (state, _) => {
                state.addKeyStatus = "start";
            }).addCase(actions.closeAddKeyDialog, (state, _) => {
                state.addKeyStatus = "idle";
            })
            .addCase(actions.addKey.pending, (state, _) => {
                state.addKeyStatus = "server-in-progress"
            })
            .addCase(actions.addKey.fulfilled, (state, action) => {
                state.addKeyStatus = "idle";
                state.environmentKeys.push(action.payload);
            })
            .addCase(actions.addKey.rejected, (state, _) => {
                state.addKeyStatus = "server-failed";
            }).addCase(actions.openInheritKeyDialog, (state, action) => {
                state.inheritKeyStatus = "start";
                state.keyToInherit = action.payload;
            })
            .addCase(actions.inheritKey.pending, (state, _) => {
                state.inheritKeyStatus = "server-in-progress"
            }).addCase(actions.closeInheritKeyDialog, (state, _) => {
                state.inheritKeyStatus = "idle";
                state.keyToInherit = null;
            }).addCase(actions.inheritKey.fulfilled, (state, action) => {
                state.inheritKeyStatus = "idle";


                const keyToReplace = state.parentKey.key;

                state.environmentKeys = state.environmentKeys.map((
                    key: IKevinValue) => key.key === keyToReplace ? state.parentKey : key);
                state.getParentKeyStatus = LoadingStatus.NotLoaded;
                state.parentKey = null;
            }).addCase(actions.inheritKey.rejected, (state, _) => {
                state.inheritKeyStatus = "server-failed";
            })
            .addCase(actions.getParentKey.pending, (state, _) => {
                state.getParentKeyStatus = LoadingStatus.Loading;
                state.parentKey = null;
            }).addCase(actions.getParentKey.fulfilled, (state, action) => {
                state.getParentKeyStatus = LoadingStatus.Loaded;
                state.parentKey = action.payload;
            }).addCase(actions.getParentKey.rejected, (state, _) => {
                state.getParentKeyStatus = LoadingStatus.Failed;
            })
    }
});




export default environmentInfoSlice.reducer;