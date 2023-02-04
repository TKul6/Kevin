export class DuplicateEnvironmentFound extends Error {
    constructor(public environmentId: string, public parentEnvironmentId: string) {
        super(`Duplicate environment found. Please make sure that the environment name is unique under the parent.`);
    }
}