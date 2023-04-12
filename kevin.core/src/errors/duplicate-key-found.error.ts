import { type IKevinValue } from "../interfaces";
import { KevinError, KevinErrorType } from "./kevin.error";

export class DuplicateKeyFoundError extends KevinError {
    constructor(private readonly info: IKevinValue) {
        super("Duplicate key found", KevinErrorType.DuplicateKey);
    }
}
