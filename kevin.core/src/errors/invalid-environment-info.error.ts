export class InvalidEnvironmentInfoError extends Error {
    constructor(public environmentName: string) {
        super("Failed to initialize environment info. Please make sure the data in the repository is valid for environment " + environmentName);
        
    }
}