import {  type IEnvironmentInformation } from "./environment-data";

export interface IKevinValue {
    key?: string;
    value: string;
    environmentInfo: IEnvironmentInformation;
}