import { createListenerMiddleware } from '@reduxjs/toolkit'
import * as actions  from './environments.actions';
import { openToast } from '../../system/systemSlice';


export const createEnvironmentFailed = createListenerMiddleware();

createEnvironmentFailed.startListening({
    actionCreator: actions.createEnvironment.rejected,
    effect: (action, listenerApi) => {
        listenerApi.dispatch(openToast({ text: action.error.message, level: 'error' }));
    }

});

export const createEnvironmentSucceeded = createListenerMiddleware();

createEnvironmentSucceeded.startListening({
    actionCreator: actions.createEnvironment.fulfilled,
    effect: (action, listenerApi) => {
        listenerApi.dispatch(openToast({ text: `Environment '${action.meta.arg.name}' was created successfully.`, level: 'success' }));
        listenerApi.dispatch(actions.closeCreateEnvironmentDialog());
    }

});

