import { createListenerMiddleware } from '@reduxjs/toolkit'
import { closeCreateEnvironmentDialog, createEnvironment } from './environmentsSlice';
import { openToast } from '../system/systemSlice';


export const createEnvironmentFailed = createListenerMiddleware();

createEnvironmentFailed.startListening({
    actionCreator: createEnvironment.rejected,
    effect: (action, listenerApi) => {
        listenerApi.dispatch(openToast({ text: action.error.message, level: 'error' }));
    }

});

export const createEnvironmentSucceeded = createListenerMiddleware();

createEnvironmentSucceeded.startListening({
    actionCreator: createEnvironment.fulfilled,
    effect: (action, listenerApi) => {
        listenerApi.dispatch(openToast({ text: `Environment '${action.meta.arg.name}' was created successfully.`, level: 'success' }));
        listenerApi.dispatch(closeCreateEnvironmentDialog());
    }

});

