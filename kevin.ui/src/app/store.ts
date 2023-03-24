import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
import environmentsReducer from '../features/environments/environmentsSlice';

export const store = configureStore({
  reducer: {
    environments: environmentsReducer,
  },
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;

