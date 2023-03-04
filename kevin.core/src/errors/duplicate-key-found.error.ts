import { type IKevinValue } from "../interfaces";

export class DuplicateKeyFoundError extends Error {
    constructor(private readonly info: IKevinValue) {
        super("Duplicate environment found");
    }
}
