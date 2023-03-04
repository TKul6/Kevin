import { IKevinManager } from '@kevin-infra/core/interfaces';
import { Param, Body, Get, Post, Put, Delete, JsonController } from 'routing-controllers';
import {Service, Inject} from 'typedi';
@JsonController("/environments")
@Service()
export class EnvironmentsController {

    constructor(@Inject("kevin.service") private readonly kevinService: IKevinManager) {
    }
//   @Get()
//   public async () {
//     return 'This action returns all users';
//   }

//   @Get('/users/:id')
//   getOne(@Param('id') id: number) {
//     return 'This action returns user #' + id;
//   }

   @Post()
   post(@Body() environment: any) {
     return 'Saving user...';
   }

//   @Put('/users/:id')
//   put(@Param('id') id: number, @Body() user: any) {
//     return 'Updating a user...';
//   }

//   @Delete('/users/:id')
//   remove(@Param('id') id: number) {
//     return 'Removing user...';
//   }
}

