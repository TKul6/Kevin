import { IEnvironmentMetaData } from "@kevin-infra/core/interfaces";

// A mock function to mimic making an async request for data
export async function getEnvironments(): Promise<Array<IEnvironmentMetaData>> {


const response = await fetch("http://localhost:3000/environments");

if(response.status === 200) {
const environments = await response.json();
  return environments;
}

throw new Error("Failed to get environments");

}
