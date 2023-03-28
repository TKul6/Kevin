import { Get, JsonController, Param, Put, Body, Post } from "routing-controllers";
import { Inject, Service } from "typedi";
import { type IKevinManager, type IKevinValue } from "@kevin-infra/core/interfaces";
import {  ValueModel } from "../models/value.model";
import {  KeyValueModel } from "../models/key-value.model";

@JsonController("/environments/:id/keys")
@Service()
export class EnvironmentKeysController{

constructor( @Inject("kevin.service")private readonly kevinService: IKevinManager) {
}

@Get()
public  async getAllKeys(@Param("id") environmentId: string): Promise<IKevinValue[]> {

        await this.kevinService.setCurrentEnvironment(environmentId);
        return await this.kevinService.getEnvironmentData();
    }

@Post()
public async addKey(@Param("id") environmentId: string, @Body() kvModel: KeyValueModel): Promise<void> {

    await this.kevinService.setCurrentEnvironment(environmentId);
    await this.kevinService.addKey(kvModel.key, kvModel.value, kvModel.defaultValue);
    return null;
}

    @Put("/:key")
    public async setKey(@Param("id") environmentId: string, @Param("key") key: string, @Body() valueModel: ValueModel): Promise<IKevinValue> {
        const envInfo = await this.kevinService.setCurrentEnvironment(environmentId);

        await this.kevinService.setValue(key, valueModel.value);

        const result: IKevinValue = {
            key,
            value: valueModel.value,
            environmentInfo: envInfo
        }
        return result;
    }
}