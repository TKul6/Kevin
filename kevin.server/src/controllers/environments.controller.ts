import {  type IEnvironmentInformation, type IEnvironmentMetaData, type IKevinManager } from '@kevin-infra/core/interfaces';
import { Param, Body, Get, Post, JsonController } from 'routing-controllers';
import {Service, Inject} from 'typedi';
// eslint-disable-next-line 
import { CreateEnvironmentModel } from '../models/create-environment.model';
@JsonController("/environments")
@Service()
export class EnvironmentsController {

    constructor(@Inject("kevin.service") private readonly kevinService: IKevinManager) {
    }

  @Get()
  public async getEnvironments(): Promise<IEnvironmentMetaData[]> {
    return await this.kevinService.getEnvironments();
  }

@Post()
   async createRootEnvironment(): Promise<IEnvironmentInformation> {
   
    return await this.kevinService.createRootEnvironment();
   }


   @Post("/:id")
   async createEnvironment(@Body() data: CreateEnvironmentModel, @Param("id") id: string): Promise<IEnvironmentMetaData> {
   
    return await this.kevinService.createEnvironment(data.environmentName, id);
   }

}

