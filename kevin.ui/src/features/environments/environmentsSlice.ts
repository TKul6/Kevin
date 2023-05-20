import { createAsyncThunk, createSlice, createAction } from '@reduxjs/toolkit';
import { RootState } from '../../app/store';
import { createNewEnvironment, getEnvironments } from './environmentsApi';
import { IEnvironmentMetaData } from "@kevin-infra/core/interfaces"
import { LoadingStatus } from '../../app/types';

export interface createEnvironmentModel {
  parentId: string;
  name: string;
}

export interface EnvironmentsState {
  environments: Array<IEnvironmentMetaData>;
  status: LoadingStatus;
  selectedEnvironment: IEnvironmentMetaData | null;
  createEnvironmentModel: createEnvironmentModel;
}

const initialState: EnvironmentsState = {
  environments: [],
  status: LoadingStatus.NotLoaded,
  selectedEnvironment: null,
  createEnvironmentModel: null

};

export const loadEnvironments = createAsyncThunk<Array<IEnvironmentMetaData>>(
  'environments/getEnvironments',
  async (r) => {

    const environments = await getEnvironments();
    return environments;
  }
);

export const selectEnvironment = createAction<string>('environments/selectEnvironment');

export const openCreateEnvironmentDialog = createAction<string>('environments/create/openDialog');

export const createEnvironment = createAsyncThunk<IEnvironmentMetaData, createEnvironmentModel>('environments/create/createEnvironment',
  async (model: createEnvironmentModel) => {

    return createNewEnvironment(model);

  });

export const closeCreateEnvironmentDialog = createAction('environments/create/closeDialog');

export const environmentsSlice = createSlice({
  name: 'environments',
  initialState,

  reducers: {

  },
  extraReducers: (builder) => {
    builder
      .addCase(loadEnvironments.pending, (state) => {
        state.status = LoadingStatus.Loading;
      })
      .addCase(loadEnvironments.fulfilled, (state, action) => {
        state.status = LoadingStatus.Loaded;
        state.environments = action.payload;
      })
      .addCase(loadEnvironments.rejected, (state) => {
        state.status = LoadingStatus.Failed;
      })
      .addCase(selectEnvironment, (state, action) => {
        const selectedEnvironment = state.environments.find(e => e.name === action.payload);
        if (selectedEnvironment) {
          state.selectedEnvironment = selectedEnvironment;
        }
      })
      .addCase(openCreateEnvironmentDialog, (state, action) => {
        state.createEnvironmentModel = { name: '', parentId: action.payload };
      }).addCase(createEnvironment.fulfilled, (state, action) => {
        state.environments.push(action.payload);
      }).addCase(closeCreateEnvironmentDialog, (state) => {
        state.createEnvironmentModel = null;
      });
  },
});


export const selectEnvironments = (state: RootState) => state.environments.environments;
export const selectCreateEnvironmentModel = (state: RootState) => state.environments.createEnvironmentModel;


export default environmentsSlice.reducer;
