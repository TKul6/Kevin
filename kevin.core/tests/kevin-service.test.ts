import 'jest';
import { IEnvironmentMetaData, IProvider } from '../src/interfaces';
import { KevinService } from '../src/services/kevin.service';
import { anything, instance, mock, verify, when } from "ts-mockito"
import { InvalidEnvironmentInfoError } from '../src/errors';

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

        });
    });

        it("should throw an error where there is  invalid fields in the KV store", async() => {

            // Arrange

            when(providerMock.getValueRange(KEVIN_INTERNAL_ENVIRONMENT_PREFIX + ".")).thenResolve([null]);
            const service = new KevinService(instance(providerMock));

            // Act + Assert
            await expect(() => service.getEnvironments()).rejects.toThrow(Error)

            // Assert
            verify(providerMock.getValueRange(KEVIN_INTERNAL_ENVIRONMENT_PREFIX + ".")).once();
           
        });

    });
});
