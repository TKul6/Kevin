import { IKevinValue } from '@kevin-infra/core/interfaces';
import { createAsyncThunk, createSlice, createAction } from '@reduxjs/toolkit';
import { DialogState } from '../../app/helpers/dialog-helpers';
import { RootState } from '../../app/store';
import { LoadingStatus } from '../../app/types';
import { addNewKey, deleteKey, getEnvironmentKeys, getKey, setEnvironmentKey } from '../environments/environmentsApi';
import { selectEnvironment } from '../environments/environmentsSlice';
import { AddKeyModel } from './dialogs/addKeyDialog';

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

export interface EditValueModel {
    existingValue: IKevinValue,
    environmentId: string
    newValue: string
}

/* #endregion */



export const loadEnvironmentKeys = createAsyncThunk<Array<IKevinValue>, string>('environmentInfo/loadEnvironmentKeys',
    async (environmentId: string) => {
        return getEnvironmentKeys(environmentId);
    }
);

/* #region  Set Key Value */
export const openSetKeyValueDialog = createAction<IKevinValue>('environmentInfo/openSetKeyValueDialog');

export const closeSetValueDialog = createAction('environmentInfo/closeSetValueDialog');

export const setKeyValue = createAsyncThunk<IKevinValue, EditValueModel>('environmentInfo/setNewValue',
    async (model: EditValueModel) => {
        return setEnvironmentKey(model.environmentId, model.existingValue.key, model.newValue);

    }
);

/* #endregion */

/* #region  Add Key */
export const selectKeyValueForEdit = createAction<IKevinValue>('environmentInfo/selectKeyValueForEdit');

export const openAddKeyDialog = createAction('environmentInfo/openAddKeyDialog');

export const addKey = createAsyncThunk<IKevinValue, AddKeyModel>('environmentInfo/addKey', async (model: AddKeyModel) => {
    return addNewKey(model);
});

export const closeAddKeyDialog = createAction('environmentInfo/closeAddKeyDialog');

/* #endregion */


/* #region inheritKey */


export interface GetKeyModel {
    key: string;
    environmentId: string;
}

export const openInheritKeyDialog = createAction<IKevinValue>('environmentInfo/openInheritKeyDialog');

export const inheritKey = createAsyncThunk<void, IKevinValue>('environmentInfo/inheritKey', async (model: IKevinValue) => {
    await deleteKey(model);

});

export const closeInheritKeyDialog = createAction('environmentInfo/closeInheritKeyDialog');

export const getParentKey = createAsyncThunk<IKevinValue, GetKeyModel>('environmentInfo/getParentKey', async (model: GetKeyModel) => {

    const parentKey = await getKey(model.key, model.environmentId);
    return parentKey;

});



/* #endregion */


export const environmentInfoSlice = createSlice({
    name: 'environmentInfo',
    initialState,

    reducers: {

    },
    extraReducers: (builder) => {
        builder
            .addCase(loadEnvironmentKeys.pending, (state) => {
                state.status = LoadingStatus.Loading;
            })
            .addCase(loadEnvironmentKeys.fulfilled, (state, action) => {
                state.status = action.payload.length > 0 ? LoadingStatus.Loaded : LoadingStatus.NoData;

                state.environmentKeys = action.payload;
            })
            .addCase(loadEnvironmentKeys.rejected, (state) => {
                state.status = LoadingStatus.Failed;
            })
            .addCase(selectEnvironment, (state, action) => {
                state.selectedEnvironmentId = action.payload;
            })
            .addCase(selectKeyValueForEdit, (state, action) => {
                state.editedKevinValue = action.payload;
            })
            .addCase(openSetKeyValueDialog, (state, action) => {
                state.editedKevinValue = action.payload;
            }).addCase(closeSetValueDialog, (state, _) => {
                state.editedKevinValue = null;
            })
            .addCase(setKeyValue.fulfilled, (state, action) => {
                const index = state.environmentKeys.findIndex(k => k.key === action.payload.key);
                if (index > -1) {
                    state.environmentKeys[index] = action.payload;
                }
                state.editedKevinValue = null;
            }).addCase(openAddKeyDialog, (state, _) => {
                state.addKeyStatus = "start";
            }).addCase(closeAddKeyDialog, (state, _) => {
                state.addKeyStatus = "idle";
            })
            .addCase(addKey.pending, (state, _) => {
                state.addKeyStatus = "server-in-progress"
            })
            .addCase(addKey.fulfilled, (state, action) => {
                state.addKeyStatus = "idle";
                state.environmentKeys.push(action.payload);
            })
            .addCase(addKey.rejected, (state, _) => {
                state.addKeyStatus = "server-failed";
            }).addCase(openInheritKeyDialog, (state, action) => {
                state.inheritKeyStatus = "start";
                state.keyToInherit = action.payload;
            })
            .addCase(inheritKey.pending, (state, _) => {
                state.inheritKeyStatus = "server-in-progress"
            }).addCase(closeInheritKeyDialog, (state, _) => {
                state.inheritKeyStatus = "idle";
                state.keyToInherit = null;
            }).addCase(inheritKey.fulfilled, (state, action) => {
                state.inheritKeyStatus = "idle";


                const keyToReplace = state.parentKey.key;

                state.environmentKeys = state.environmentKeys.map((
                    key: IKevinValue) => key.key === keyToReplace ? state.parentKey : key);
                state.getParentKeyStatus = LoadingStatus.NotLoaded;
                state.parentKey = null;
            }).addCase(inheritKey.rejected, (state, _) => {
                state.inheritKeyStatus = "server-failed";
            })
            .addCase(getParentKey.pending, (state, _) => {
                state.getParentKeyStatus = LoadingStatus.Loading;
                state.parentKey = null;
            }).addCase(getParentKey.fulfilled, (state, action) => {
                state.getParentKeyStatus = LoadingStatus.Loaded;
                state.parentKey = action.payload;
            }).addCase(getParentKey.rejected, (state, _) => {
                state.getParentKeyStatus = LoadingStatus.Failed;
            })
    }
});


/* #region selectors */

export const selectEnvironmentInfo = (state: RootState) => state.environmentInfo;

export const selectSelectedEnvironmentId = (state: RootState) => state.environmentInfo.selectedEnvironmentId;

export const selectEditedKevinValue = (state: RootState) => state.environmentInfo.editedKevinValue;

export const selectAddKeyStatus = (state: RootState) => state.environmentInfo.addKeyStatus;

export const selectLoadingStatus = (state: RootState) => state.environmentInfo.status;

export const selectKeyToInherit = (state: RootState) => state.environmentInfo.keyToInherit;

export const selectParentKeyStatus = (state: RootState) => state.environmentInfo.getParentKeyStatus;
export const selectParentKey = (state: RootState) => state.environmentInfo.parentKey;

/* #endregion */

export default environmentInfoSlice.reducer;