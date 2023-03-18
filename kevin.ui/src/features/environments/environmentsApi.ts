import { IEnvironmentMetaData } from "@kevin-infra/core/interfaces";

// A mock function to mimic making an async request for data
export async function getEnvironments(): Promise<Array<IEnvironmentMetaData>> {


const response = await fetch("http://localhost:3000/environments");

if(response.status === 200) {
  console.log("success");
const environments = await response.json();
  return environments;
}

console.log("failed");
throw new Error("Failed to get environments");

}
