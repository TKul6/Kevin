import {Length, IsDefined} from 'class-validator';

export class CreateEnvironmentModel {

     @Length(3, 10)
     @IsDefined()
    environmentName: string;
}