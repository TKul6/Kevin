export class KevinError extends Error {
    constructor(message: string, public code: KevinErrorType) {
        super(message);
    }
}

export enum KevinErrorType {
    DuplicateKey = 1,
    DuplicateEnvironment,
    EnvironmentNotSet,
    InvalidEnvironmentInfo,
    EnvironmentNotFound,
    InvalidOperation,
    KeyNotFound
}