import {  createSlice } from '@reduxjs/toolkit';
import { IEnvironmentMetaData } from "@kevin-infra/core/interfaces"
import { LoadingStatus } from '../../../app/types';
import { createEnvironmentModel } from './models/create-environment.model';
import * as actions from './environments.actions';


/* #region state */
export interface EnvironmentsState {
  environments: Array<IEnvironmentMetaData>;
  status: LoadingStatus;
  selectedEnvironment: IEnvironmentMetaData | null;
  createEnvironmentModel: createEnvironmentModel;
}

export const initialState: EnvironmentsState = {
  environments: [],
  status: LoadingStatus.NotLoaded,
  selectedEnvironment: null,
  createEnvironmentModel: null

};

/* #endregion */



export const environmentsSlice = createSlice({
  name: 'environments',
  initialState,

  reducers: {

  },
  extraReducers: (builder) => {
    builder
      .addCase(actions.loadEnvironments.pending, (state) => {
        state.status = LoadingStatus.Loading;
      })
      .addCase(actions.loadEnvironments.fulfilled, (state, action) => {
        state.status = LoadingStatus.Loaded;
        state.environments = action.payload;
      })
      .addCase(actions.loadEnvironments.rejected, (state) => {
        state.status = LoadingStatus.Failed;
      })
      .addCase(actions.selectEnvironment, (state, action) => {
        const selectedEnvironment = state.environments.find(e => e.name === action.payload);
        if (selectedEnvironment) {
          state.selectedEnvironment = selectedEnvironment;
        }
      })
      .addCase(actions.openCreateEnvironmentDialog, (state, action) => {
        state.createEnvironmentModel = { name: '', parentId: action.payload };
      }).addCase(actions.createEnvironment.fulfilled, (state, action) => {
        state.environments.push(action.payload);
      }).addCase(actions.closeCreateEnvironmentDialog, (state) => {
        state.createEnvironmentModel = null;
      });
  },
});




export default environmentsSlice.reducer;
