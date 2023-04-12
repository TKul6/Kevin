import { KevinError, KevinErrorType } from "./kevin.error";

export class InvalidEnvironmentInfoError extends KevinError {
    constructor(public environmentName: string) {
        super("Failed to initialize environment info. Please make sure the data in the repository is valid for environment " + environmentName, KevinErrorType.InvalidEnvironmentInfo);
        
    }
}