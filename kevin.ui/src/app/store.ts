import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
import { addKeyFailedMiddleware, addKeySuccessMiddleware, inheritKeyMiddleware, keysLoaderMiddleware, SetValueFailedMiddleware, SetValueSuccessMiddleware } from '../features/environmentInfo/state/environment-info.middlewares';
import environmentInfoSlice from '../features/environmentInfo/state/environment-info.slice';
import systemSlice from '../features/system/systemSlice';
import environmentsReducer from '../features/environments/state/environments.slice';
import { createEnvironmentFailed, createEnvironmentSucceeded } from '../features/environments/state/environments.middlewares';

export const store = configureStore({
  reducer: {
    environments: environmentsReducer,
    environmentInfo: environmentInfoSlice,
    system: systemSlice
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware()
    .prepend(keysLoaderMiddleware.middleware)
    .prepend(SetValueSuccessMiddleware.middleware)
    .prepend(SetValueFailedMiddleware.middleware)
    .prepend(createEnvironmentFailed.middleware)
    .prepend(createEnvironmentSucceeded.middleware)
    .prepend(addKeySuccessMiddleware.middleware)
    .prepend(addKeyFailedMiddleware.middleware)
    .prepend(inheritKeyMiddleware.middleware),
  devTools: true
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;

