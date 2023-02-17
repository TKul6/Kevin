import { IKevinValue } from "../interfaces";

export class DuplicateKeyFoundError extends Error {
    constructor(private info: IKevinValue) {
        super("Duplicate environment found");
    }
}
