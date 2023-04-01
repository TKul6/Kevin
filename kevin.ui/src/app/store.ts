import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
import { keysLoaderMiddleware, SetValueFailedMiddleware, SetValueSuccessMiddleware } from '../features/environmentInfo/environmentInfoMiddlewares';
import environmentInfoSlice from '../features/environmentInfo/environmentInfoSlice';
import systemSlice from '../features/system/systemSlice';
import environmentsReducer from '../features/environments/environmentsSlice';

export const store = configureStore({
  reducer: {
    environments: environmentsReducer,
    environmentInfo: environmentInfoSlice,
    system: systemSlice
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().prepend(keysLoaderMiddleware.middleware).prepend(SetValueSuccessMiddleware.middleware).prepend(SetValueFailedMiddleware.middleware),
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;

