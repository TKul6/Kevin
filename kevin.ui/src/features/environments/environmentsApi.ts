import { IEnvironmentMetaData, IKevinValue } from "@kevin-infra/core/interfaces";
import { AddKeyModel } from "../environmentInfo/dialogs/addKeyDialog";
import { createEnvironmentModel } from "./state";


export async function getEnvironments(): Promise<Array<IEnvironmentMetaData>> {


  const response = await fetch("/environments");

  if (response.status === 200) {
    const environments = await response.json();
    return environments;
  }

  throw new Error("Failed to get environments");

}

export async function getEnvironmentKeys(environmentId: string): Promise<Array<IKevinValue>> {

  const url = `/environments/${encodeURIComponent(environmentId)}/keys`;

  const response = await fetch(url);

  if (response.status === 200) {
    const environments = await response.json();
    return environments;
  }

  throw new Error("Failed to get keys for environment " + environmentId);

}

export async function setEnvironmentKey(environmentId: string, key: string, value: string): Promise<IKevinValue> {


  const url = `/environments/${encodeURIComponent(environmentId)}/keys/${encodeURIComponent(key)}`;

  const response = await fetch(url, { method: 'PUT', body: JSON.stringify({ value: value }), headers: { 'Content-Type': 'application/json' }, });

  if (response.status === 200) {
    return await response.json();
  }

  throw new Error("Failed to get keys for environment " + environmentId);

}

export async function createNewEnvironment(createModel: createEnvironmentModel): Promise<IEnvironmentMetaData> {


  const response = await fetch(`/environments/${encodeURIComponent(createModel.parentId)}`, { method: 'POST', body: JSON.stringify({ environmentName: createModel.name }), headers: { 'Content-Type': 'application/json' } });

  switch (response.status) {
    case 201:
      const newEnvironment = await response.json();
      return newEnvironment;
    case 409:
      throw new Error(`Opps, it seems the environment '${createModel.name}' already exists under the same parent.`);
  }


  throw new Error(`Failed to create environment '${createModel.name}'`);

}

export async function addNewKey(addKeyModel: AddKeyModel): Promise<IKevinValue> {


  const response = await fetch(`/environments/${encodeURIComponent(addKeyModel.environmentId)}/keys`, { method: 'POST', body: JSON.stringify(addKeyModel), headers: { 'Content-Type': 'application/json' } });

  if (response.status === 201) {
    const newEnvironment = await response.json();
    return newEnvironment;
  }

  else if (response.status === 409) {
    throw new Error(`Opps, it seems the key '${addKeyModel.key}' already exists.`)
  }

  throw new Error("Failed to add key");

}

export async function deleteKey(key: IKevinValue): Promise<void> {


  const response = await fetch(`/environments/${encodeURIComponent(key.environmentInfo.id)}/keys/${encodeURIComponent(key.key)}`, { method: 'DELETE' });

  if (response.status === 204) {
    return;
  }

  throw new Error("Failed to inherit key");

}

export async function getKey(key: string, environmentId: string): Promise<IKevinValue> {

  const response = await fetch(`/environments/${encodeURIComponent(environmentId)}/keys/${encodeURIComponent(key)}`);

  if (response.status === 200) {
    return await response.json();
  }

  throw new Error("Failed to get key");
}
