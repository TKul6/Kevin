import 'jest';
import { IEnvironmentInformation, IEnvironmentMetaData, IProvider } from '../src/interfaces';
import { KevinService } from '../src/services/kevin.service';
import { anyString, anything, instance, mock, verify, when } from "ts-mockito"
import { EnvironmentNotFoundError, EnvironmentNotSetError, InvalidEnvironmentInfoError } from '../src/errors';

const DEFAULT_ENVIRONMENT_NAME = "default";
const DEFAULT_ENVIRONMENT_ID = "default";
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

    describe("create default environment", () => {
        test("should create default environment", async () => {

            // Arrange

            when(providerMock.setValue(`${KEVIN_INTERNAL_ENVIRONMENT_PREFIX}.${DEFAULT_ENVIRONMENT_ID}`, anything())).thenResolve(null);

            const service = new KevinService(instance(providerMock));

            // Act
            const environment = await service.createDefaultEnvironment();
            // Assert
            expect(environment.name).toBe(DEFAULT_ENVIRONMENT_NAME);
            expect(environment.id).toBe(DEFAULT_ENVIRONMENT_ID);
            expect(environment.parentEnvironment).toBeNull();

            verify(providerMock.setValue(`${KEVIN_INTERNAL_ENVIRONMENT_PREFIX}.${DEFAULT_ENVIRONMENT_ID}`, anything())).once();
            verify(providerMock.setValue(anyString(), anything())).once();

        });
    });

    describe("get environments", () => {

        it("should return a single environment", async () => {

            // Arrange
            const envData: IEnvironmentMetaData = {
                name: DEFAULT_ENVIRONMENT_NAME,
                id: DEFAULT_ENVIRONMENT_ID,
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
                name: DEFAULT_ENVIRONMENT_NAME,
                id: DEFAULT_ENVIRONMENT_ID,
                parentEnvironmentId: PARENT_ENVIRONMENT_ID
            };

            const anotherEnvData: IEnvironmentMetaData = {
                name: "another",
                id: "another",
                parentEnvironmentId: DEFAULT_ENVIRONMENT_ID
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
        it("should set the default environment", async () => {

            // Arrange
            const envMetadata: IEnvironmentMetaData = {
                name: DEFAULT_ENVIRONMENT_NAME,
                id: DEFAULT_ENVIRONMENT_ID,
                parentEnvironmentId: null
            }

            when(providerMock.getValue(KEVIN_INTERNAL_ENVIRONMENT_PREFIX + "." + DEFAULT_ENVIRONMENT_NAME)).thenResolve(JSON.stringify(envMetadata));

            const service = new KevinService(instance(providerMock));

            // Act
            const envInfo = await service.setCurrentEnvironment(DEFAULT_ENVIRONMENT_NAME);

            // Assert
            expect(envInfo.name).toBe(DEFAULT_ENVIRONMENT_NAME);
            expect(envInfo.id).toBe(DEFAULT_ENVIRONMENT_ID);
            expect(envInfo.parentEnvironment).toBeNull();

            verify(providerMock.getValue(KEVIN_INTERNAL_ENVIRONMENT_PREFIX + "." + DEFAULT_ENVIRONMENT_NAME)).once();
            verify(providerMock.getValue(anyString())).once();


        });

        it("should build the environment's hierarchy correctly", async () => {

            // Arrange
            const parentEnvironment: IEnvironmentMetaData = {
                name: DEFAULT_ENVIRONMENT_NAME,
                id: DEFAULT_ENVIRONMENT_ID,
                parentEnvironmentId: null
            }

            const childEnvironmentName = "child";
            const childEnvironmentId = "child";
            const childEnvironment: IEnvironmentMetaData = {
                name: childEnvironmentName,
                id: childEnvironmentId,
                parentEnvironmentId: DEFAULT_ENVIRONMENT_ID
            }

            when(providerMock.getValue(KEVIN_INTERNAL_ENVIRONMENT_PREFIX + "." + DEFAULT_ENVIRONMENT_NAME)).thenResolve(JSON.stringify(parentEnvironment));
            when(providerMock.getValue(KEVIN_INTERNAL_ENVIRONMENT_PREFIX + "." + childEnvironmentName)).thenResolve(JSON.stringify(childEnvironment));

            const service = new KevinService(instance(providerMock));

            // Act
            const envInfo = await service.setCurrentEnvironment(childEnvironmentName);

            // Assert
            expect(envInfo.name).toBe(childEnvironmentName);
            expect(envInfo.id).toBe(childEnvironmentId);
            expect(envInfo.parentEnvironment).toBeDefined();
            expect(envInfo.parentEnvironment.name).toBe(DEFAULT_ENVIRONMENT_NAME);
            expect(envInfo.parentEnvironment.id).toBe(DEFAULT_ENVIRONMENT_ID);
            expect(envInfo.parentEnvironment.parentEnvironment).toBeNull();

            verify(providerMock.getValue(KEVIN_INTERNAL_ENVIRONMENT_PREFIX + "." + DEFAULT_ENVIRONMENT_NAME)).once();
            verify(providerMock.getValue(KEVIN_INTERNAL_ENVIRONMENT_PREFIX + "." + childEnvironmentName)).once();
            verify(providerMock.getValue(anyString())).twice();

        });

        it("should throw an error if the environment metadata does not exists in the KV store.", async () => {

            // Arrange

            when(providerMock.getValue(KEVIN_INTERNAL_ENVIRONMENT_PREFIX + "." + DEFAULT_ENVIRONMENT_NAME)).thenResolve(null);

            const service = new KevinService(instance(providerMock));

            // Act + Assert
            await expect(() => service.setCurrentEnvironment(DEFAULT_ENVIRONMENT_NAME)).rejects.toThrow(EnvironmentNotFoundError);

            // Assert

            verify(providerMock.getValue(KEVIN_INTERNAL_ENVIRONMENT_PREFIX + "." + DEFAULT_ENVIRONMENT_NAME)).once();
            verify(providerMock.getValue(anyString())).once();
        });

        it("should throw an error if the data in the KV store is invalid.", async () => {

            // Arrange

            when(providerMock.getValue(KEVIN_INTERNAL_ENVIRONMENT_PREFIX + "." + DEFAULT_ENVIRONMENT_NAME)).thenResolve("invalid data");

            const service = new KevinService(instance(providerMock));

            // Act + Assert
            await expect(() => service.setCurrentEnvironment(DEFAULT_ENVIRONMENT_NAME)).rejects.toThrow(InvalidEnvironmentInfoError);

            // Assert

            verify(providerMock.getValue(KEVIN_INTERNAL_ENVIRONMENT_PREFIX + "." + DEFAULT_ENVIRONMENT_NAME)).once();
            verify(providerMock.getValue(anyString())).once();
        });

    })

    describe("get value", () => {


        const ENVIRONMENT_INFO: IEnvironmentInformation = {
            name: DEFAULT_ENVIRONMENT_NAME,
            id: DEFAULT_ENVIRONMENT_ID,
            parentEnvironment: null
        }

        it("should returned the value stored in the current environment", async () => {

            // Arrange
            const keyName = "key";
            const keyValue = "value";
            const keyPath = `${ENVIRONMENT_INFO.id}.keys.${keyName}`;
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
                name: DEFAULT_ENVIRONMENT_NAME,
                id: DEFAULT_ENVIRONMENT_ID,
                parentEnvironment: null
            }

            const childEnvironment: IEnvironmentInformation = {
                name: childEnvironmentName,
                id: childEnvironmentId,
                parentEnvironment: parentEnvironment

            }


            const keyName = "key";
            const keyValue = "value";
            const childKeyPath = `${childEnvironment.id}.keys.${keyName}`;
            const parentKeyPath = `${parentEnvironment.id}.keys.${keyName}`;
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
                name: DEFAULT_ENVIRONMENT_NAME,
                id: DEFAULT_ENVIRONMENT_ID,
                parentEnvironment: null
            }

            const childEnvironment: IEnvironmentInformation = {
                name: childEnvironmentName,
                id: childEnvironmentId,
                parentEnvironment: parentEnvironment

            }

            const keyName = "key";

            const childKeyPath = `${childEnvironment.id}.keys.${keyName}`;
            const parentKeyPath = `${parentEnvironment.id}.keys.${keyName}`;
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
            name: DEFAULT_ENVIRONMENT_NAME,
            id: DEFAULT_ENVIRONMENT_ID,
            parentEnvironment: null
        }

        it("should set the value in the right location in the KV store", async () => {
            // Arrange
            const keyName = "key";
            const keyValue = "value";

            const fullKey = `${ENVIRONMENT_INFO.id}.keys.${keyName}`;

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

        it("should get all the keys of the default environment", async () => {

            const environmentInfo: IEnvironmentInformation = {
                name: DEFAULT_ENVIRONMENT_NAME,
                id: DEFAULT_ENVIRONMENT_ID,
                parentEnvironment: null
            }

            when(providerMock.getKeys(`${DEFAULT_ENVIRONMENT_NAME}.keys.`)).thenResolve(KEYS);

            for (let i = 0; i < KEYS.length; i++) {
                when(providerMock.getValue(`${DEFAULT_ENVIRONMENT_NAME}.keys.${KEYS[i]}`)).thenResolve(VALUES[i]);
            }

            const service = new KevinService(instance(providerMock), environmentInfo);

            // Act
            const keys = await service.getEnvironmentData();

            // Assert
            expect(keys.length).toBe(KEYS.length);

            for (let i = 0; i < KEYS.length; i++) {
                expect(keys[i].value).toBe(VALUES[i]);
                expect(keys[i].environmentInfo.id).toBe(DEFAULT_ENVIRONMENT_ID)
                verify(providerMock.getValue(`${DEFAULT_ENVIRONMENT_NAME}.keys.${KEYS[i]}`)).once();
            }


            verify(providerMock.getKeys(anyString())).once();

            verify(providerMock.getValue(anyString())).times(KEYS.length);


        });

        it("should get all the keys of the environment from the current environment to the root environment", async () => {


            const environmentInfo: IEnvironmentInformation = {
                name: DEFAULT_ENVIRONMENT_NAME,
                id: DEFAULT_ENVIRONMENT_ID,
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

            when(providerMock.getKeys(`${DEFAULT_ENVIRONMENT_NAME}.keys.`)).thenResolve(KEYS);


            when(providerMock.getValue(`${DEFAULT_ENVIRONMENT_NAME}.keys.${KEYS[0]}`)).thenResolve(VALUES[0]);

            when(providerMock.getValue(`${childEnvironmentId}.keys.${KEYS[0]}`)).thenResolve(null);
            when(providerMock.getValue(`${childEnvironmentId}.keys.${KEYS[1]}`)).thenResolve(VALUES[1]);


            when(providerMock.getValue(`${grandChildEnvironmentId}.keys.${KEYS[0]}`)).thenResolve(null);
            when(providerMock.getValue(`${grandChildEnvironmentId}.keys.${KEYS[1]}`)).thenResolve(null);
            when(providerMock.getValue(`${grandChildEnvironmentId}.keys.${KEYS[2]}`)).thenResolve(VALUES[2]);


            const service = new KevinService(instance(providerMock), grandChildEnvironment);

            // Act
            const keys = await service.getEnvironmentData();

            // Assert
            expect(keys.length).toBe(KEYS.length);

            expect(keys[0].value).toBe(VALUES[0]);
            expect(keys[0].environmentInfo.id).toBe(DEFAULT_ENVIRONMENT_ID)
            verify(providerMock.getValue(`${DEFAULT_ENVIRONMENT_NAME}.keys.${KEYS[0]}`)).once();

            expect(keys[1].value).toBe(VALUES[1]);
            expect(keys[1].environmentInfo.id).toBe(childEnvironmentId)
            verify(providerMock.getValue(`${childEnvironmentId}.keys.${KEYS[1]}`)).once();

            expect(keys[2].value).toBe(VALUES[2]);
            expect(keys[2].environmentInfo.id).toBe(grandChildEnvironmentId)
            verify(providerMock.getValue(`${grandChildEnvironmentId}.keys.${KEYS[2]}`)).once();

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
});