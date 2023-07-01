import { RootState } from "../../../app/store";

export const selectEnvironments = (state: RootState) => state.environments.environments;
export const selectCreateEnvironmentModel = (state: RootState) => state.environments.createEnvironmentModel;
