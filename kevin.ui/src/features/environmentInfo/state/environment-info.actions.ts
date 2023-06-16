import { IKevinValue } from "@kevin-infra/core/interfaces";
import { createAction, createAsyncThunk } from "@reduxjs/toolkit";
import { addNewKey, deleteKey, getEnvironmentKeys, getKey, setEnvironmentKey } from "../../environments/environmentsApi";
import { AddKeyModel } from "../dialogs/addKeyDialog";
import { EditValueModel } from "./models/edit-value.model";
import { GetKeyModel } from "./models/get-key.model";

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