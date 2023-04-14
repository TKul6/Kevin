import { KevinError, KevinErrorType } from "./kevin.error";

export class DuplicateEnvironmentFound extends KevinError {
    constructor(public environmentId: string, public parentEnvironmentId: string) {
        super(`Duplicate environment found. Please make sure that the environment name is unique under the parent.`, KevinErrorType.DuplicateEnvironment);
    }
}