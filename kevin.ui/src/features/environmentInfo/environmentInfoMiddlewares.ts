import { createListenerMiddleware } from '@reduxjs/toolkit'
import { selectEnvironment } from '../environments/environmentsSlice';
import { openToast } from '../system/systemSlice';
import { addKey, closeAddKeyDialog, closeInheritKeyDialog, getParentKey, inheritKey, loadEnvironmentKeys, openInheritKeyDialog, setKeyValue } from './environmentInfoSlice';

export const keysLoaderMiddleware = createListenerMiddleware();

keysLoaderMiddleware.startListening({
    actionCreator: selectEnvironment,
    effect: (action, listenerApi) => {
        listenerApi.dispatch(loadEnvironmentKeys(action.payload));
    }

});

export const SetValueSuccessMiddleware = createListenerMiddleware();

SetValueSuccessMiddleware.startListening({
    actionCreator: setKeyValue.fulfilled,
    effect: (action, listenerApi) => {
        const message = `Value for key '${action.payload.key}' was successfully updated to '${action.payload.value}'`;
        listenerApi.dispatch(openToast({ text: message, level: 'success' }));
    }
});


export const SetValueFailedMiddleware = createListenerMiddleware()

SetValueFailedMiddleware.startListening({
    actionCreator: setKeyValue.rejected,
    effect: (action, listenerApi) => {
        const message = `Failed to set key '${action.meta.arg.existingValue.key}'`;
        listenerApi.dispatch(openToast({ text: message, level: 'error' }));
    }
});


export const addKeySuccessMiddleware = createListenerMiddleware();

SetValueSuccessMiddleware.startListening({
    actionCreator: addKey.fulfilled,
    effect: (action, listenerApi) => {
        const message = `Key '${action.payload.key}' was added successfully.`;
        listenerApi.dispatch(openToast({ text: message, level: 'success' }));
        listenerApi.dispatch(closeAddKeyDialog());
    }
});


export const addKeyFailedMiddleware = createListenerMiddleware()

SetValueFailedMiddleware.startListening({
    actionCreator: addKey.rejected,
    effect: (action, listenerApi) => {
        const message = action.error.message;
        listenerApi.dispatch(openToast({ text: message, level: 'error' }));
    }
});


export const inheritKeyMiddleware = createListenerMiddleware();

inheritKeyMiddleware.startListening({
    actionCreator: inheritKey.fulfilled,
    effect: (action, listenerApi) => {
        const message = `Key '${action.meta.arg.key}' is now inherits from '${action.meta.arg.environmentInfo.parentEnvironment.name}'.`;
        listenerApi.dispatch(openToast({ text: message, level: 'success' }));
        listenerApi.dispatch(closeInheritKeyDialog());
    }
});


inheritKeyMiddleware.startListening({
    actionCreator: inheritKey.rejected,
    effect: (action, listenerApi) => {
        const message = action.error.message;
        listenerApi.dispatch(openToast({ text: message, level: 'error' }));
    }
});

inheritKeyMiddleware.startListening({
    actionCreator: openInheritKeyDialog,
    effect: (action, listenerApi) => {
        listenerApi.dispatch(getParentKey({ key: action.payload.key, environmentId: action.payload.environmentInfo.parentEnvironment.id }));
    }
});

inheritKeyMiddleware.startListening({
    actionCreator: getParentKey.rejected,
    effect: (action, listenerApi) => {
        const key = action.meta.arg.key;
        const environmentId = action.meta.arg.environmentId;
        const message = `Failed to get parent key for key '${key}' in environment '${environmentId}'.`;
        listenerApi.dispatch(openToast({ text: message, level: 'error' }));
    }
});