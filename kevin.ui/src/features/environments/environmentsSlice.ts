import { createAsyncThunk, createSlice, createAction } from '@reduxjs/toolkit';
import { RootState } from '../../app/store';
import { getEnvironments } from './environmentsApi';
import  {IEnvironmentMetaData} from "@kevin-infra/core/interfaces"

export interface EnvironmentsState {
  environments: Array<IEnvironmentMetaData>,
  status: 'idle' | 'loading' | 'failed';
  selectedEnvironment: IEnvironmentMetaData | null;
}

const initialState: EnvironmentsState = {
  environments: [],
  status: "idle",
  selectedEnvironment: null
};

export const loadEnvironments = createAsyncThunk<Array<IEnvironmentMetaData>>(
  'environments/getEnvironments',
  async (r) => {
    
    const environments = await getEnvironments();
    return environments;
      }
);

export const selectEnvironment = createAction<string>('environments/selectEnvironment');

export const environmentsSlice = createSlice({
  name: 'environments',
  initialState,
 
  reducers: {
    
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadEnvironments.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(loadEnvironments.fulfilled, (state, action) => {
        state.status = 'idle';
        console.log("action.payload: " + JSON.stringify(action.payload));
        state.environments = action.payload;
      })
      .addCase(loadEnvironments.rejected, (state) => {
        state.status = 'failed';
      })
      .addCase(selectEnvironment, (state, action) => {
        const selectedEnvironment = state.environments.find(e => e.name === action.payload);
        if(selectedEnvironment) {
          state.selectedEnvironment = selectedEnvironment;
        }
      })
  },
});


// The function below is called a selector and allows us to select a value from
// the state. Selectors can also be defined inline where they're used instead of
// in the slice file. For example: `useSelector((state: RootState) => state.counter.value)`
export const selectEnvironments = (state: RootState) => state.environments.environments;



export default environmentsSlice.reducer;