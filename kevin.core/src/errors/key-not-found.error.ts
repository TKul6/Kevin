import { KevinError, KevinErrorType } from "./kevin.error";

export class KeyNotFoundError extends KevinError {
    constructor(public key: string, public environmentId: string) {
        super(`Could not find key ${key} under environment ${environmentId}`, KevinErrorType.KeyNotFound);
    }
}