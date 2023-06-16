import {
  Get,
  JsonController,
  Param,
  Put,
  Body,
  Post,
  HttpCode,
  Delete,
  ForbiddenError,
  OnUndefined,
} from 'routing-controllers';
import {
  Inject,
  Service,
} from 'typedi';
import {
  type IKevinManager,
  type IKevinValue,
} from '@kevin-infra/core/interfaces';
import { type ValueModel } from '../models/value.model';
import { type KeyValueModel } from '../models/key-value.model';

@JsonController(
  '/environments/:id/keys'
)
@Service()
export class EnvironmentKeysController {
  constructor(
    @Inject('kevin.service')
    private readonly kevinService: IKevinManager
  ) { }

  @Get()
  public async getAllKeys(
    @Param('id') environmentId: string
  ): Promise<IKevinValue[]> {
    await this.kevinService.setCurrentEnvironment(
      environmentId
    );
    return await this.kevinService.getEnvironmentData();
  }

  @HttpCode(201)
  @Post()
  public async addKey(
    @Param('id') environmentId: string,
    @Body() kvModel: KeyValueModel
  ): Promise<IKevinValue> {
    const currentEnvInfo =
      await this.kevinService.setCurrentEnvironment(
        environmentId
      );
    await this.kevinService.addKey(
      kvModel.key,
      kvModel.value,
      kvModel.defaultValue
    );
    return {
      key: kvModel.key,
      value: kvModel.value,
      environmentInfo: currentEnvInfo,
    };
  }

  @Put('/:key')
  public async setKey(
    @Param('id') environmentId: string,
    @Param('key') key: string,
    @Body() valueModel: ValueModel
  ): Promise<IKevinValue> {
    const envInfo =
      await this.kevinService.setCurrentEnvironment(environmentId);

    await this.kevinService.setValue(
      key,
      valueModel.value
    );

    const result: IKevinValue = {
      key,
      value: valueModel.value,
      environmentInfo: envInfo,
    };
    return result;
  }

  @Get('/:key')
  @OnUndefined(404)
  public async getKey(
    @Param('id') environmentId: string, @Param('key') key: string): Promise<IKevinValue> {

    await this.kevinService.setCurrentEnvironment(environmentId);

    const value = await this.kevinService.getValue(key);

    // Todo handle null


    return value;
  }


  @Delete('/:key')
  public async deleteKey(@Param('id') environmentId: string,
    @Param('key') key: string): Promise<void> {

    if (environmentId === "root") {
      throw new ForbiddenError("Deleting keys from root environment is not allowed");
    }

    await this.kevinService.setCurrentEnvironment(environmentId);
    await this.kevinService.deleteKey(key);
    return null;

  }

}