import { IEnvironmentMetaData, IKevinValue } from "@kevin-infra/core/interfaces";
import { CreateKeyModel } from "../environmentInfo/dialogs/addKeyDialog";
import { createEnvironmentModel } from "./environmentsSlice";

const base = "http://localhost:3000";

export async function getEnvironments(): Promise<Array<IEnvironmentMetaData>> {


  const response = await fetch(`${base}/environments`);

  if (response.status === 200) {
    const environments = await response.json();
    return environments;
  }

  throw new Error("Failed to get environments");

}

export async function getEnvironmentKeys(environmentId: string): Promise<Array<IKevinValue>> {

  const url = `${base}/environments/${encodeURIComponent(environmentId)}/keys`;

  const response = await fetch(url);

  if (response.status === 200) {
    const environments = await response.json();
    return environments;
  }

  throw new Error("Failed to get keys for environment " + environmentId);

}

export async function setEnvironmentKey(environmentId: string, key: string, value: string): Promise<IKevinValue> {


  const url = `${base}/environments/${encodeURIComponent(environmentId)}/keys/${encodeURIComponent(key)}`;

  const response = await fetch(url, { method: 'PUT', body: JSON.stringify({ value: value }), headers: { 'Content-Type': 'application/json' }, });

  if (response.status === 200) {
    return await response.json();
  }

  throw new Error("Failed to get keys for environment " + environmentId);

}

export async function createNewEnvironment(createModel: createEnvironmentModel): Promise<IEnvironmentMetaData> {


  const response = await fetch(`${base}/environments/${encodeURIComponent(createModel.parentId)}`, { method: 'POST', body: JSON.stringify({ environmentName   : createModel.name }), headers: { 'Content-Type': 'application/json' } });

  if (response.status === 201) {
    const newEnvironment = await response.json();
    return newEnvironment;
  }

  throw new Error("Failed to create environment");

}

export async function addNewKey(addKeyModel: CreateKeyModel): Promise<IKevinValue> {


  const response = await fetch(`${base}/environments/${encodeURIComponent(addKeyModel.environmentId)}/keys`, { method: 'POST', body: JSON.stringify(addKeyModel), headers: { 'Content-Type': 'application/json' } });

  if (response.status === 201) {
    const newEnvironment = await response.json();
    return newEnvironment;
  }

  throw new Error("Failed to add key");

}