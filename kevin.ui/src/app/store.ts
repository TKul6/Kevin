import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
import { keysLoaderMiddleware } from '../features/environmentInfo/environmentInfoMiddlewares';
import environmentInfoSlice from '../features/environmentInfo/environmentInfoSlice';

import environmentsReducer from '../features/environments/environmentsSlice';

export const store = configureStore({
  reducer: {
    environments: environmentsReducer,
    environmentInfo: environmentInfoSlice
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().prepend(keysLoaderMiddleware.middleware),
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;

