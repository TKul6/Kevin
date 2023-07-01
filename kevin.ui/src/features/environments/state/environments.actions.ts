import { IEnvironmentMetaData } from "@kevin-infra/core/interfaces";
import { createAction, createAsyncThunk } from "@reduxjs/toolkit";
import { createNewEnvironment, getEnvironments } from "../environmentsApi";
import { createEnvironmentModel } from "./models/create-environment.model";

export const loadEnvironments = createAsyncThunk<Array<IEnvironmentMetaData>>(
    'environments/getEnvironments',
    async (r) => {

        const environments = await getEnvironments();
        return environments;
    }
);

export const selectEnvironment = createAction<string>('environments/selectEnvironment');

/* #region create environment */
export const openCreateEnvironmentDialog = createAction<string>('environments/create/openDialog');


export const createEnvironment = createAsyncThunk<IEnvironmentMetaData, createEnvironmentModel>('environments/create/createEnvironment',
    async (model: createEnvironmentModel) => {

        return createNewEnvironment(model);

    });

export const closeCreateEnvironmentDialog = createAction('environments/create/closeDialog');

/* #endregion */