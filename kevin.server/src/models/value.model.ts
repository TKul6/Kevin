import {Length, IsDefined} from 'class-validator';

export class ValueModel  {

     @Length(3)
     @IsDefined()
    value: string;
}