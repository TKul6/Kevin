import { createListenerMiddleware } from '@reduxjs/toolkit'
import { selectEnvironment } from '../environments/environmentsSlice';
import { loadEnvironmentKeys } from './environmentInfoSlice';

export const keysLoaderMiddleware = createListenerMiddleware();

keysLoaderMiddleware.startListening({
    actionCreator: selectEnvironment,
    effect: (action, listenerApi) => {
        listenerApi.dispatch(loadEnvironmentKeys(action.payload));
    }

});