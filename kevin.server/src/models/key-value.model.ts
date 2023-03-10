import { IsDefined, Length } from "class-validator";
import { ValueModel } from "./value.model";

export class KeyValueModel extends ValueModel {
     @Length(3)
     @IsDefined()
    key: string;

     @Length(3)
     @IsDefined()
    defaultValue: string;


}