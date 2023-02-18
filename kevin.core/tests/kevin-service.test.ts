import 'jest';
import { IEnvironmentInformation, IEnvironmentMetaData, IProvider } from '../src/interfaces';
import { KevinService } from '../src/services/kevin.service';
import { anyString, anything, instance, mock, verify, when } from "ts-mockito"
import { EnvironmentNotFoundError, EnvironmentNotSetError, InvalidEnvironmentInfoError, DuplicateEnvironmentFound, DuplicateKeyFoundError } from '../src/errors';

const ROOT_ENVIRONMENT_NAME = "root";
const ROOT_ENVIRONMENT_ID = "root";
const PARENT_ENVIRONMENT_ID = "6";
const KEVIN_INTERNAL_ENVIRONMENT_PREFIX = "kevin.internal.environments";


describe("KevinService", () => {

    let providerMock: IProvider;

    beforeEach(() => {
        providerMock = mock<IProvider>();
    })

    describe("constructor", () => {
        test("should throw exception when initializing service with no provider", () => {
            expect(() => new KevinService(null))
                .toThrow();
        });

    })

    describe("create root environment", () => {
        test("should create root environment", async () => {

            // Arrange

            when(providerMock.setValue(`${KEVIN_INTERNAL_ENVIRONMENT_PREFIX}.${ROOT_ENVIRONMENT_ID}`, anything())).thenResolve(null);

            const service = new KevinService(instance(providerMock));

            // Act
            const environment = await service.createRootEnvironment();
            // Assert
            expect(environment.name).toBe(ROOT_ENVIRONMENT_NAME);
            expect(environment.id).toBe(ROOT_ENVIRONMENT_ID);
            expect(environment.parentEnvironment).toBeNull();

            verify(providerMock.setValue(`${KEVIN_INTERNAL_ENVIRONMENT_PREFIX}.${ROOT_ENVIRONMENT_ID}`, anything())).once();
            verify(providerMock.setValue(anyString(), anything())).once();

        });
    });

    describe("get environments", () => {

        it("should return a single environment", async () => {

            // Arrange
            const envData: IEnvironmentMetaData = {
                name: ROOT_ENVIRONMENT_NAME,
                id: ROOT_ENVIRONMENT_ID,
                parentEnvironmentId: PARENT_ENVIRONMENT_ID
            };

            when(providerMock.getValueRange(KEVIN_INTERNAL_ENVIRONMENT_PREFIX + ".")).thenResolve([JSON.stringify(envData)]);
            const service = new KevinService(instance(providerMock));

            // Act 
            const result = await service.getEnvironments()

            // Assert
            expect(result).toHaveLength(1);
            expect(result[0]).toEqual(envData);
            verify(providerMock.getValueRange(KEVIN_INTERNAL_ENVIRONMENT_PREFIX + ".")).once();
            verify(providerMock.getValueRange(anyString())).once();

        });

        it("should return multiple environments", async () => {

            // Arrange
            const envData: IEnvironmentMetaData = {
                name: ROOT_ENVIRONMENT_NAME,
                id: ROOT_ENVIRONMENT_ID,
                parentEnvironmentId: PARENT_ENVIRONMENT_ID
            };

            const anotherEnvData: IEnvironmentMetaData = {
                name: "another",
                id: "another",
                parentEnvironmentId: ROOT_ENVIRONMENT_ID
            };

            when(providerMock.getValueRange(KEVIN_INTERNAL_ENVIRONMENT_PREFIX + "."))
                .thenResolve([JSON.stringify(envData), JSON.stringify(anotherEnvData)]);
            const service = new KevinService(instance(providerMock));

            // Act 
            const result = await service.getEnvironments()

            // Assert
            expect(result).toHaveLength(2);
            expect(result[0]).toEqual(envData);
            expect(result[1]).toEqual(anotherEnvData);
            verify(providerMock.getValueRange(KEVIN_INTERNAL_ENVIRONMENT_PREFIX + ".")).once();
            verify(providerMock.getValueRange(anyString())).once();

        });

        [[], null].forEach(emptyResult => {
            it("should return an empty array when no environments exists", async () => {

                // Arrange

                when(providerMock.getValueRange(KEVIN_INTERNAL_ENVIRONMENT_PREFIX + ".")).thenResolve(emptyResult);
                const service = new KevinService(instance(providerMock));

                // Act 
                const result = await service.getEnvironments()

                // Assert
                expect(result).toHaveLength(0);
                verify(providerMock.getValueRange(KEVIN_INTERNAL_ENVIRONMENT_PREFIX + ".")).once();
                verify(providerMock.getValueRange(anyString())).once();

            });
        });

        it("should throw an error where there is  invalid fields in the KV store", async () => {

            // Arrange

            when(providerMock.getValueRange(KEVIN_INTERNAL_ENVIRONMENT_PREFIX + ".")).thenResolve([null]);
            const service = new KevinService(instance(providerMock));

            // Act + Assert
            await expect(() => service.getEnvironments()).rejects.toThrow(Error)

            // Assert
            verify(providerMock.getValueRange(KEVIN_INTERNAL_ENVIRONMENT_PREFIX + ".")).once();
            verify(providerMock.getValueRange(anyString())).once();

        });

    });

    describe("set current environment", () => {
        it("should set the root environment", async () => {

            // Arrange
            const envMetadata: IEnvironmentMetaData = {
                name: ROOT_ENVIRONMENT_NAME,
                id: ROOT_ENVIRONMENT_ID,
                parentEnvironmentId: null
            }

            when(providerMock.getValue(KEVIN_INTERNAL_ENVIRONMENT_PREFIX + "." + ROOT_ENVIRONMENT_ID)).thenResolve(JSON.stringify(envMetadata));

            const service = new KevinService(instance(providerMock));

            // Act
            const envInfo = await service.setCurrentEnvironment(ROOT_ENVIRONMENT_ID);

            // Assert
            expect(envInfo.name).toBe(ROOT_ENVIRONMENT_NAME);
            expect(envInfo.id).toBe(ROOT_ENVIRONMENT_ID);
            expect(envInfo.parentEnvironment).toBeNull();

            verify(providerMock.getValue(KEVIN_INTERNAL_ENVIRONMENT_PREFIX + "." + ROOT_ENVIRONMENT_ID)).once();
            verify(providerMock.getValue(anyString())).once();


        });

        it("should build the environment's hierarchy correctly", async () => {

            // Arrange
            const parentEnvironment: IEnvironmentMetaData = {
                name: ROOT_ENVIRONMENT_NAME,
                id: ROOT_ENVIRONMENT_ID,
                parentEnvironmentId: null
            }

            const childEnvironmentName = "child";
            const childEnvironmentId = "child";
            const childEnvironment: IEnvironmentMetaData = {
                name: childEnvironmentName,
                id: childEnvironmentId,
                parentEnvironmentId: ROOT_ENVIRONMENT_ID
            }

            when(providerMock.getValue(KEVIN_INTERNAL_ENVIRONMENT_PREFIX + "." + ROOT_ENVIRONMENT_ID)).thenResolve(JSON.stringify(parentEnvironment));
            when(providerMock.getValue(KEVIN_INTERNAL_ENVIRONMENT_PREFIX + "." + childEnvironmentId)).thenResolve(JSON.stringify(childEnvironment));

            const service = new KevinService(instance(providerMock));

            // Act
            const envInfo = await service.setCurrentEnvironment(childEnvironmentName);

            // Assert
            expect(envInfo.name).toBe(childEnvironmentName);
            expect(envInfo.id).toBe(childEnvironmentId);
            expect(envInfo.parentEnvironment).toBeDefined();
            expect(envInfo.parentEnvironment.name).toBe(ROOT_ENVIRONMENT_NAME);
            expect(envInfo.parentEnvironment.id).toBe(ROOT_ENVIRONMENT_ID);
            expect(envInfo.parentEnvironment.parentEnvironment).toBeNull();

            verify(providerMock.getValue(KEVIN_INTERNAL_ENVIRONMENT_PREFIX + "." + ROOT_ENVIRONMENT_ID)).once();
            verify(providerMock.getValue(KEVIN_INTERNAL_ENVIRONMENT_PREFIX + "." + childEnvironmentId)).once();
            verify(providerMock.getValue(anyString())).twice();

        });

        it("should throw an error if the environment metadata does not exists in the KV store.", async () => {

            // Arrange

            when(providerMock.getValue(KEVIN_INTERNAL_ENVIRONMENT_PREFIX + "." + ROOT_ENVIRONMENT_ID)).thenResolve(null);

            const service = new KevinService(instance(providerMock));

            // Act + Assert
            await expect(() => service.setCurrentEnvironment(ROOT_ENVIRONMENT_ID)).rejects.toThrow(EnvironmentNotFoundError);

            // Assert

            verify(providerMock.getValue(KEVIN_INTERNAL_ENVIRONMENT_PREFIX + "." + ROOT_ENVIRONMENT_ID)).once();
            verify(providerMock.getValue(anyString())).once();
        });

        it("should throw an error if the data in the KV store is invalid.", async () => {

            // Arrange

            when(providerMock.getValue(KEVIN_INTERNAL_ENVIRONMENT_PREFIX + "." + ROOT_ENVIRONMENT_ID)).thenResolve("invalid data");

            const service = new KevinService(instance(providerMock));

            // Act + Assert
            await expect(() => service.setCurrentEnvironment(ROOT_ENVIRONMENT_ID)).rejects.toThrow(InvalidEnvironmentInfoError);

            // Assert

            verify(providerMock.getValue(KEVIN_INTERNAL_ENVIRONMENT_PREFIX + "." + ROOT_ENVIRONMENT_ID)).once();
            verify(providerMock.getValue(anyString())).once();
        });

    })

    describe("get value", () => {


        const ENVIRONMENT_INFO: IEnvironmentInformation = {
            name: ROOT_ENVIRONMENT_NAME,
            id: ROOT_ENVIRONMENT_ID,
            parentEnvironment: null
        }

        it("should returned the value stored in the current environment", async () => {

            // Arrange
            const keyName = "key";
            const keyValue = "value";
            const keyPath = `kevin.${ENVIRONMENT_INFO.id}.keys.${keyName}`;
            when(providerMock.getValue(keyPath)).thenResolve(keyValue);

            const service = new KevinService(instance(providerMock), ENVIRONMENT_INFO);

            // Act
            const result = await service.getValue(keyName);

            // Assert
            expect(result.value).toBe(keyValue);
            expect(result.environmentInfo.id).toBe(ENVIRONMENT_INFO.id);
            verify(providerMock.getValue(keyPath)).once();
            verify(providerMock.getValue(anyString())).once();

        })

        it("should returned the value stored in the parent environment", async () => {

            // Arrange
            const childEnvironmentName = "child";
            const childEnvironmentId = "child";
            const parentEnvironment: IEnvironmentInformation = {
                name: ROOT_ENVIRONMENT_NAME,
                id: ROOT_ENVIRONMENT_ID,
                parentEnvironment: null
            }

            const childEnvironment: IEnvironmentInformation = {
                name: childEnvironmentName,
                id: childEnvironmentId,
                parentEnvironment: parentEnvironment

            }


            const keyName = "key";
            const keyValue = "value";
            const childKeyPath = `kevin.${childEnvironment.id}.keys.${keyName}`;
            const parentKeyPath = `kevin.${parentEnvironment.id}.keys.${keyName}`;
            when(providerMock.getValue(childKeyPath)).thenResolve(null);
            when(providerMock.getValue(parentKeyPath)).thenResolve(keyValue);

            const service = new KevinService(instance(providerMock), childEnvironment);

            // Act
            const result = await service.getValue(keyName);

            // Assert
            expect(result.value).toBe(keyValue);
            expect(result.environmentInfo.id).toBe(parentEnvironment.id);
            verify(providerMock.getValue(childKeyPath)).once();
            verify(providerMock.getValue(parentKeyPath)).once();
            verify(providerMock.getValue(anyString())).twice();

        });

        it("should handle key does not exists", async () => {

            // Arrange
            const childEnvironmentName = "child";
            const childEnvironmentId = "child";
            const parentEnvironment: IEnvironmentInformation = {
                name: ROOT_ENVIRONMENT_NAME,
                id: ROOT_ENVIRONMENT_ID,
                parentEnvironment: null
            }

            const childEnvironment: IEnvironmentInformation = {
                name: childEnvironmentName,
                id: childEnvironmentId,
                parentEnvironment: parentEnvironment

            }

            const keyName = "key";

            const childKeyPath = `kevin.${childEnvironment.id}.keys.${keyName}`;
            const parentKeyPath = `kevin.${parentEnvironment.id}.keys.${keyName}`;
            when(providerMock.getValue(childKeyPath)).thenResolve(null);
            when(providerMock.getValue(parentKeyPath)).thenResolve(null);

            const service = new KevinService(instance(providerMock), childEnvironment);

            // Act
            const result = await service.getValue(keyName);

            // Assert
            expect(result).toBeNull();
            verify(providerMock.getValue(childKeyPath)).once();
            verify(providerMock.getValue(parentKeyPath)).once();
            verify(providerMock.getValue(anyString())).twice();

        });

        it("should throw an error when trying to set a value while the environment is not set.", async () => {
            // Arrange
            const keyName = "key";

            const service = new KevinService(instance(providerMock));

            // Act + Assert
            await expect(() => service.getValue(keyName)).rejects.toThrow(EnvironmentNotSetError);

            // Assert
            verify(providerMock.setValue(anyString(), anyString())).never();

        })

    })

    describe("set value", () => {

        const ENVIRONMENT_INFO: IEnvironmentInformation = {
            name: ROOT_ENVIRONMENT_NAME,
            id: ROOT_ENVIRONMENT_ID,
            parentEnvironment: null
        }

        it("should set the value in the right location in the KV store", async () => {
            // Arrange
            const keyName = "key";
            const keyValue = "value";

            const fullKey = `kevin.${ENVIRONMENT_INFO.id}.keys.${keyName}`;

            when(providerMock.setValue(fullKey, keyValue)).thenResolve();

            const service = new KevinService(instance(providerMock), ENVIRONMENT_INFO);

            // Act
            await service.setValue(keyName, keyValue);

            // Assert
            verify(providerMock.setValue(fullKey, keyValue)).once();
            verify(providerMock.setValue(anyString(), anyString())).once();

        })

        it("should throw an error when trying to set a value while the environment is not set.", async () => {
            // Arrange
            const keyName = "key";
            const keyValue = "value";

            const service = new KevinService(instance(providerMock));

            // Act + Assert
            await expect(() => service.setValue(keyName, keyValue)).toThrow(EnvironmentNotSetError);

            // Assert
            verify(providerMock.setValue(anyString(), anyString())).never();

        })

    })

    describe("get environment data", () => {

        // Arrange
        const KEYS = ["key1", "key2", "key3"];
        const VALUES = ["value1", "value2", "value3"];

        it("should get all the keys of the root environment", async () => {

            const environmentInfo: IEnvironmentInformation = {
                name: ROOT_ENVIRONMENT_NAME,
                id: ROOT_ENVIRONMENT_ID,
                parentEnvironment: null
            }

            when(providerMock.getKeys(`kevin.${ROOT_ENVIRONMENT_NAME}.keys.`)).thenResolve(KEYS);

            for (let i = 0; i < KEYS.length; i++) {
                when(providerMock.getValue(`kevin.${ROOT_ENVIRONMENT_NAME}.keys.${KEYS[i]}`)).thenResolve(VALUES[i]);
            }

            const service = new KevinService(instance(providerMock), environmentInfo);

            // Act
            const keys = await service.getEnvironmentData();

            // Assert
            expect(keys.length).toBe(KEYS.length);

            for (let i = 0; i < KEYS.length; i++) {
                expect(keys[i].value).toBe(VALUES[i]);
                expect(keys[i].environmentInfo.id).toBe(ROOT_ENVIRONMENT_ID)
                verify(providerMock.getValue(`kevin.${ROOT_ENVIRONMENT_NAME}.keys.${KEYS[i]}`)).once();
            }


            verify(providerMock.getKeys(anyString())).once();

            verify(providerMock.getValue(anyString())).times(KEYS.length);


        });

        it("should get all the keys of the environment from the current environment to the root environment", async () => {


            const environmentInfo: IEnvironmentInformation = {
                name: ROOT_ENVIRONMENT_NAME,
                id: ROOT_ENVIRONMENT_ID,
                parentEnvironment: null
            }

            const childEnvironmentName = "child";
            const childEnvironmentId = "childId";
            const childEnvironment: IEnvironmentInformation = {
                name: childEnvironmentName,
                id: childEnvironmentId,
                parentEnvironment: environmentInfo
            }

            const grandChildEnvironmentName = "gChild";
            const grandChildEnvironmentId = "gChildId";
            const grandChildEnvironment: IEnvironmentInformation = {
                name: grandChildEnvironmentName,
                id: grandChildEnvironmentId,
                parentEnvironment: childEnvironment
            }

            when(providerMock.getKeys(`kevin.${ROOT_ENVIRONMENT_NAME}.keys.`)).thenResolve(KEYS);


            when(providerMock.getValue(`kevin.${ROOT_ENVIRONMENT_NAME}.keys.${KEYS[0]}`)).thenResolve(VALUES[0]);

            when(providerMock.getValue(`kevin.${childEnvironmentId}.keys.${KEYS[0]}`)).thenResolve(null);
            when(providerMock.getValue(`kevin.${childEnvironmentId}.keys.${KEYS[1]}`)).thenResolve(VALUES[1]);


            when(providerMock.getValue(`kevin.${grandChildEnvironmentId}.keys.${KEYS[0]}`)).thenResolve(null);
            when(providerMock.getValue(`kevin.${grandChildEnvironmentId}.keys.${KEYS[1]}`)).thenResolve(null);
            when(providerMock.getValue(`kevin.${grandChildEnvironmentId}.keys.${KEYS[2]}`)).thenResolve(VALUES[2]);


            const service = new KevinService(instance(providerMock), grandChildEnvironment);

            // Act
            const keys = await service.getEnvironmentData();

            // Assert
            expect(keys.length).toBe(KEYS.length);

            expect(keys[0].value).toBe(VALUES[0]);
            expect(keys[0].environmentInfo.id).toBe(ROOT_ENVIRONMENT_ID)
            verify(providerMock.getValue(`kevin.${ROOT_ENVIRONMENT_NAME}.keys.${KEYS[0]}`)).once();

            expect(keys[1].value).toBe(VALUES[1]);
            expect(keys[1].environmentInfo.id).toBe(childEnvironmentId)
            verify(providerMock.getValue(`kevin.${childEnvironmentId}.keys.${KEYS[1]}`)).once();

            expect(keys[2].value).toBe(VALUES[2]);
            expect(keys[2].environmentInfo.id).toBe(grandChildEnvironmentId)
            verify(providerMock.getValue(`kevin.${grandChildEnvironmentId}.keys.${KEYS[2]}`)).once();

            verify(providerMock.getKeys(anyString())).once();
            verify(providerMock.getValue(anyString())).times(6);

        });

        it("should handle no environment set", async () => {



            const service = new KevinService(instance(providerMock));

            // Act + Assert
            await expect(() => service.getEnvironmentData()).rejects.toThrow(EnvironmentNotSetError);

            // Assert
            verify(providerMock.getKeys(anyString())).never();
            verify(providerMock.getValue(anyString())).never();

        });


    })

    describe("create environment", () => {

        const NEW_ENVIRONMENT_NAME = "newEnvironment";

        it("should create a new environment under the root environment.", async () => {

            // Arrange

            const expectedEnvironmentId = `${ROOT_ENVIRONMENT_ID}/${NEW_ENVIRONMENT_NAME}`;

            when(providerMock.hasKey(`${KEVIN_INTERNAL_ENVIRONMENT_PREFIX}.${ROOT_ENVIRONMENT_ID}`)).thenResolve(true);
            when(providerMock.getValue(`${KEVIN_INTERNAL_ENVIRONMENT_PREFIX}.${ROOT_ENVIRONMENT_ID}`))
                .thenResolve(JSON.stringify({ name: ROOT_ENVIRONMENT_NAME, id: ROOT_ENVIRONMENT_ID, parentEnvironmentId: null }));
            when(providerMock.hasKey(`${KEVIN_INTERNAL_ENVIRONMENT_PREFIX}.${expectedEnvironmentId}`)).thenResolve(false);
            when(providerMock.setValue(`${KEVIN_INTERNAL_ENVIRONMENT_PREFIX}.${expectedEnvironmentId}`, anything())).thenResolve();


            const service = new KevinService(instance(providerMock));

            // Act
            const newEnvironment = await service.createEnvironment(NEW_ENVIRONMENT_NAME, ROOT_ENVIRONMENT_ID);

            // Assert
            expect(newEnvironment.name).toBe(NEW_ENVIRONMENT_NAME);
            expect(newEnvironment.id).toBe(expectedEnvironmentId);
            expect(newEnvironment.parentEnvironmentId).toBe(ROOT_ENVIRONMENT_ID);

            verify(providerMock.hasKey(`${KEVIN_INTERNAL_ENVIRONMENT_PREFIX}.${ROOT_ENVIRONMENT_ID}`)).once();
            verify(providerMock.hasKey(`${KEVIN_INTERNAL_ENVIRONMENT_PREFIX}.${expectedEnvironmentId}`)).once();
            verify(providerMock.setValue(`${KEVIN_INTERNAL_ENVIRONMENT_PREFIX}.${expectedEnvironmentId}`, anything())).once();

            verify(providerMock.hasKey(anyString())).twice()
            verify(providerMock.setValue(anyString(), anything())).once();
            verify(providerMock.setValue(anyString(), anything())).once();

        });

        it("should create a new environment under the current environment.", async () => {


            // Arrange

            const rootEnvironment: IEnvironmentInformation = {
                name: ROOT_ENVIRONMENT_NAME,
                id: ROOT_ENVIRONMENT_ID,
                parentEnvironment: null
            }

            const parentEnvironmentName = "parentEnvironment";
            const parentEnvironmentId = `${ROOT_ENVIRONMENT_ID}/${parentEnvironmentName}`;
            const parentEnvironment: IEnvironmentInformation = {
                name: parentEnvironmentName,
                id: parentEnvironmentId,
                parentEnvironment: rootEnvironment
            }

            const expectedEnvironmentId = `${parentEnvironmentId}/${NEW_ENVIRONMENT_NAME}`;

            when(providerMock.hasKey(`${KEVIN_INTERNAL_ENVIRONMENT_PREFIX}.${expectedEnvironmentId}`)).thenResolve(false);
            when(providerMock.setValue(`${KEVIN_INTERNAL_ENVIRONMENT_PREFIX}.${expectedEnvironmentId}`, anything())).thenResolve();


            const service = new KevinService(instance(providerMock), parentEnvironment);

            // Act
            const newEnvironment = await service.createEnvironment(NEW_ENVIRONMENT_NAME);

            // Assert
            expect(newEnvironment.name).toBe(NEW_ENVIRONMENT_NAME);
            expect(newEnvironment.id).toBe(expectedEnvironmentId);
            expect(newEnvironment.parentEnvironmentId).toBe(parentEnvironmentId);

            verify(providerMock.hasKey(`${KEVIN_INTERNAL_ENVIRONMENT_PREFIX}.${parentEnvironmentId}`)).never();
            verify(providerMock.hasKey(`${KEVIN_INTERNAL_ENVIRONMENT_PREFIX}.${expectedEnvironmentId}`)).once();
            verify(providerMock.setValue(`${KEVIN_INTERNAL_ENVIRONMENT_PREFIX}.${expectedEnvironmentId}`, anything())).once();

            verify(providerMock.hasKey(anyString())).once();
            verify(providerMock.setValue(anyString(), anything())).once();

        });

        it("should handle parent environment does not exists.", async () => {

            // Arrange
            when(providerMock.hasKey(`${KEVIN_INTERNAL_ENVIRONMENT_PREFIX}.${PARENT_ENVIRONMENT_ID}`)).thenResolve(false);

            const service = new KevinService(instance(providerMock));

            // Act + Assert
            await expect(async () => await service.createEnvironment(NEW_ENVIRONMENT_NAME, PARENT_ENVIRONMENT_ID))
                .rejects.toThrow(EnvironmentNotFoundError);

            verify(providerMock.hasKey(`${KEVIN_INTERNAL_ENVIRONMENT_PREFIX}.${PARENT_ENVIRONMENT_ID}`)).once();

            verify(providerMock.hasKey(anyString())).once();
            verify(providerMock.setValue(anyString(), anything())).never();

        });

        it("should handle current environment is not set.", async () => {


            const service = new KevinService(instance(providerMock));

            // Act + Assert
            await expect(async () => await service.createEnvironment(NEW_ENVIRONMENT_NAME))
                .rejects.toThrow(EnvironmentNotSetError);

            verify(providerMock.hasKey(anyString())).never();
            verify(providerMock.setValue(anyString(), anything())).never();
        });

        it("should handle environment already exists.", async () => {

            // Arrange
            const expectedEnvironmentId = `${ROOT_ENVIRONMENT_ID}/${NEW_ENVIRONMENT_NAME}`;

            when(providerMock.hasKey(`${KEVIN_INTERNAL_ENVIRONMENT_PREFIX}.${ROOT_ENVIRONMENT_ID}`)).thenResolve(true);
            when(providerMock.hasKey(`${KEVIN_INTERNAL_ENVIRONMENT_PREFIX}.${expectedEnvironmentId}`)).thenResolve(true);

            const service = new KevinService(instance(providerMock));

            // Act + Assert
            await expect(async () => await service.createEnvironment(NEW_ENVIRONMENT_NAME, ROOT_ENVIRONMENT_ID))
                .rejects.toThrow(DuplicateEnvironmentFound);

            // Assert

            verify(providerMock.hasKey(`${KEVIN_INTERNAL_ENVIRONMENT_PREFIX}.${ROOT_ENVIRONMENT_ID}`)).once();
            verify(providerMock.hasKey(`${KEVIN_INTERNAL_ENVIRONMENT_PREFIX}.${expectedEnvironmentId}`)).once();


            verify(providerMock.hasKey(anyString())).twice()
            verify(providerMock.setValue(anyString(), anything())).never();

        });

        it("should create a new environment under the root environment while cleaning the id.", async () => {

            // Arrange

            const environmentName = "environment Name";
            const expectedEnvironmentId = `${ROOT_ENVIRONMENT_ID}/environment_Name`;

            when(providerMock.hasKey(`${KEVIN_INTERNAL_ENVIRONMENT_PREFIX}.${ROOT_ENVIRONMENT_ID}`)).thenResolve(true);
            when(providerMock.getValue(`${KEVIN_INTERNAL_ENVIRONMENT_PREFIX}.${ROOT_ENVIRONMENT_ID}`))
                .thenResolve(JSON.stringify({ name: ROOT_ENVIRONMENT_NAME, id: ROOT_ENVIRONMENT_ID, parentEnvironmentId: null }));
            when(providerMock.hasKey(`${KEVIN_INTERNAL_ENVIRONMENT_PREFIX}.${expectedEnvironmentId}`)).thenResolve(false);
            when(providerMock.setValue(`${KEVIN_INTERNAL_ENVIRONMENT_PREFIX}.${expectedEnvironmentId}`, anything())).thenResolve();


            const service = new KevinService(instance(providerMock));

            // Act
            const newEnvironment = await service.createEnvironment(environmentName, ROOT_ENVIRONMENT_ID);

            // Assert
            expect(newEnvironment.name).toBe(environmentName);
            expect(newEnvironment.id).toBe(expectedEnvironmentId);
            expect(newEnvironment.parentEnvironmentId).toBe(ROOT_ENVIRONMENT_ID);

            verify(providerMock.hasKey(`${KEVIN_INTERNAL_ENVIRONMENT_PREFIX}.${ROOT_ENVIRONMENT_ID}`)).once();
            verify(providerMock.hasKey(`${KEVIN_INTERNAL_ENVIRONMENT_PREFIX}.${expectedEnvironmentId}`)).once();
            verify(providerMock.setValue(`${KEVIN_INTERNAL_ENVIRONMENT_PREFIX}.${expectedEnvironmentId}`, anything())).once();

            verify(providerMock.hasKey(anyString())).twice()
            verify(providerMock.setValue(anyString(), anything())).once();
            verify(providerMock.setValue(anyString(), anything())).once();

        });



    })

    describe("add key", () => {

        it("should add a new key to the root environment.", async () => {
            // Arrange
            const rootEnvironment: IEnvironmentInformation = {
                name: ROOT_ENVIRONMENT_NAME,
                id: ROOT_ENVIRONMENT_ID,
                parentEnvironment: null
            }

            const keyName = "newKey";
            const keyValue = "newValue";

            const keyFullPath = `kevin.${rootEnvironment.id}.keys.${keyName}`;
            when(providerMock.getValue(keyFullPath)).thenResolve(null);

            const service = new KevinService(instance(providerMock), rootEnvironment);

            // Act
            await service.addKey(keyName, keyValue);

            verify(providerMock.setValue(keyFullPath, keyValue)).once();
            verify(providerMock.getValue(keyFullPath)).once();
            verify(providerMock.setValue(anyString(), anyString())).once();
            verify(providerMock.getValue(anyString())).once();

        });

        it("should handle adding a new key to the current environment and the root environment.", async () => {
            // Arrange
            const environment: IEnvironmentInformation = {
                name: "environment",
                id: `${ROOT_ENVIRONMENT_ID}/myEnv`,
                parentEnvironment: {
                    name: ROOT_ENVIRONMENT_NAME,
                    id: ROOT_ENVIRONMENT_ID,
                    parentEnvironment: null
                }

            }

            const keyName = "newKey";
            const keyValue = "newValue";
            const defaultValue = "defaultValue";

            const keyFullPath = `kevin.${environment.id}.keys.${keyName}`;
            when(providerMock.getValue(keyFullPath)).thenResolve(null);

            const rootKeyFullPath = `kevin.${ROOT_ENVIRONMENT_ID}.keys.${keyName}`;
            when(providerMock.getValue(rootKeyFullPath)).thenResolve(null);

            const service = new KevinService(instance(providerMock), environment);

            // Act
            await service.addKey(keyName, keyValue, defaultValue);

            verify(providerMock.setValue(keyFullPath, keyValue)).once();
            verify(providerMock.setValue(rootKeyFullPath, defaultValue)).once();
            verify(providerMock.getValue(keyFullPath)).once();
            verify(providerMock.getValue(rootKeyFullPath)).once();
            verify(providerMock.setValue(anyString(), anyString())).twice();
            verify(providerMock.getValue(anyString())).twice();

        });

        it("should set a default value in the root environment event if none was provided.", async () => {
            // Arrange
            const environment: IEnvironmentInformation = {
                name: "environment",
                id: `${ROOT_ENVIRONMENT_ID}/myEnv`,
                parentEnvironment: {
                    name: ROOT_ENVIRONMENT_NAME,
                    id: ROOT_ENVIRONMENT_ID,
                    parentEnvironment: null
                }

            }

            const keyName = "newKey";
            const keyValue = "newValue";

            const keyFullPath = `kevin.${environment.id}.keys.${keyName}`;
            when(providerMock.getValue(keyFullPath)).thenResolve(null);

            const rootKeyFullPath = `kevin.${ROOT_ENVIRONMENT_ID}.keys.${keyName}`;
            when(providerMock.getValue(rootKeyFullPath)).thenResolve(null);

            const service = new KevinService(instance(providerMock), environment);

            // Act
            await service.addKey(keyName, keyValue);

            verify(providerMock.setValue(keyFullPath, keyValue)).once();
            verify(providerMock.setValue(rootKeyFullPath, "")).once();
            verify(providerMock.getValue(keyFullPath)).once();
            verify(providerMock.getValue(rootKeyFullPath)).once();
            verify(providerMock.setValue(anyString(), anyString())).twice();
            verify(providerMock.getValue(anyString())).twice();

        });

        it("should handle no current environment is set.", async () => {
            // Arrange
       
            const service = new KevinService(instance(providerMock));

            // Act + Assert
            expect(async () => await service.addKey("anyKey", "anyValue")).rejects.toThrow(EnvironmentNotSetError);;

            verify(providerMock.setValue(anyString(), anyString())).never();
            verify(providerMock.getValue(anyString())).never();
        });

        it("should handle the key already in the environment.", async () => {

            // Arrange
            const environment: IEnvironmentInformation = {
                name: "environment",
                id: `${ROOT_ENVIRONMENT_ID}/myEnv`,
                parentEnvironment: {
                    name: ROOT_ENVIRONMENT_NAME,
                    id: ROOT_ENVIRONMENT_ID,
                    parentEnvironment: null
                }

            }

            const keyName = "newKey";
            const keyValue = "newValue";

            const keyFullPath = `kevin.${environment.id}.keys.${keyName}`;
            when(providerMock.getValue(keyFullPath)).thenResolve(keyValue);


            const service = new KevinService(instance(providerMock), environment);

            // Act + Assert
           await expect(async() => await service.addKey(keyName, keyValue)).rejects.toThrow(DuplicateKeyFoundError);

            verify(providerMock.getValue(keyFullPath)).once();
            verify(providerMock.setValue(anyString(), anyString())).never();
            verify(providerMock.getValue(anyString())).once();
        });

        it("should throw an error if parent environment contains the key.", async () => {
            // Arrange
            const environment: IEnvironmentInformation = {
                name: "environment",
                id: `${ROOT_ENVIRONMENT_ID}/myEnv`,
                parentEnvironment: {
                    name: ROOT_ENVIRONMENT_NAME,
                    id: ROOT_ENVIRONMENT_ID,
                    parentEnvironment: null
                }

            }

            const keyName = "newKey";
            const keyValue = "newValue";

            const currentEnvironmentFullKey = `kevin.${environment.id}.keys.${keyName}`;

            const rootEnvironmentFullKey = `kevin.${ROOT_ENVIRONMENT_ID}.keys.${keyName}`;
            when(providerMock.getValue(currentEnvironmentFullKey)).thenResolve(null);

            when(providerMock.getValue(rootEnvironmentFullKey)).thenResolve(keyValue);

            const service = new KevinService(instance(providerMock), environment);

            // Act + Assert
         await  expect(async () => await service.addKey(keyName, keyValue)).rejects.toThrowError(DuplicateKeyFoundError);


            // Assert
            verify(providerMock.getValue(currentEnvironmentFullKey)).once();
            verify(providerMock.getValue(rootEnvironmentFullKey)).once();
            verify(providerMock.setValue(anyString(), anyString())).never();
            verify(providerMock.getValue(anyString())).twice();

        });

    })
});
