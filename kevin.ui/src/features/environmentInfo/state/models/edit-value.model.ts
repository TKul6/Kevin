import { IKevinValue } from "@kevin-infra/core/interfaces"

export interface EditValueModel {
    existingValue: IKevinValue,
    environmentId: string
    newValue: string
}
