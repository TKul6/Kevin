export interface IEnvironmentMetaData {
    name: string;
    id: string;
   parentEnvironmentId: string;
}

export interface IEnvironmentInformation {
    name: string;
    id: string;
   parentEnvironment: IEnvironmentInformation;
}