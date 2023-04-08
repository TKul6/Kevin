import { IEnvironmentMetaData } from "@kevin-infra/core/interfaces";

export function getEnvironment(environments: Array<IEnvironmentMetaData>, id: string): IEnvironmentMetaData {
    return environments.find(env => env.id === id);
}