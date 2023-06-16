import { RootState } from "../../../app/store";

export const selectEnvironmentInfo = (state: RootState) => state.environmentInfo;

export const selectSelectedEnvironmentId = (state: RootState) => state.environmentInfo.selectedEnvironmentId;

export const selectEditedKevinValue = (state: RootState) => state.environmentInfo.editedKevinValue;

export const selectAddKeyStatus = (state: RootState) => state.environmentInfo.addKeyStatus;

export const selectLoadingStatus = (state: RootState) => state.environmentInfo.status;

export const selectKeyToInherit = (state: RootState) => state.environmentInfo.keyToInherit;

export const selectParentKeyStatus = (state: RootState) => state.environmentInfo.getParentKeyStatus;

export const selectParentKey = (state: RootState) => state.environmentInfo.parentKey;
