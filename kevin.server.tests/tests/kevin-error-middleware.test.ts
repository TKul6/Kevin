import 'jest';
import * as kevinErrorsHandlerMiddleware from "@kevin-infra/server/middlewares";
import { DuplicateEnvironmentFound, DuplicateKeyFoundError, EnvironmentNotFoundError, InvalidEnvironmentInfoError } from "@kevin-infra/core/errors";
import { getMockReq, getMockRes } from '@jest-mock/express'

describe("KevinErrorMiddleware", () => {
    const middleware = new kevinErrorsHandlerMiddleware.KevinErrorHandlerMiddleware();

    let req, res;
    let  next: (_) => void;
    let nextCalled: boolean;

    beforeEach(() => {
        req = getMockReq();
        res = getMockRes().res;
        nextCalled = false;
        next = (_) => {
            nextCalled = true;
        };
    });

    it('should handle duplicate key error', () => {

        // Arrange
        const error = new DuplicateKeyFoundError(null);

        // Act
        middleware.error(error, req, res, next);

        // Assert
        expect(res.status).toHaveBeenCalledWith(409);
        expect(res.send).toHaveBeenCalledWith({ message: error.message });
        expect(nextCalled).toBe(true);
    })

    it('should handle duplicate environment error', () => {

        // Arrange
        const error = new DuplicateEnvironmentFound("root/env", "root");

        // Act
        middleware.error(error, req, res, next);

        // Assert
        expect(res.status).toHaveBeenCalledWith(409);
        expect(res.send).toHaveBeenCalledWith({ message: error.message });
        expect(nextCalled).toBe(true);
    })

    it('should handle environment not found error', () => {

        // Arrange
        const error = new EnvironmentNotFoundError("root/env");

        // Act
        middleware.error(error, req, res, next);

        // Assert
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.send).toHaveBeenCalledWith({ message: error.message });
        expect(nextCalled).toBe(true);
    })

    it('should handle invalid environment info providederror', () => {

        // Arrange
        const error = new InvalidEnvironmentInfoError("root/env");

        // Act
        middleware.error(error, req, res, next);

        // Assert
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.send).toHaveBeenCalledWith({ message: error.message });
        expect(nextCalled).toBe(true);
    })

    it('should not handle the error if it is not kevin error', () => {

        // Arrange
        const error = new Error("just an error");

        // Act
        middleware.error(error, req, res, next);

        // Assert
        expect(res.status).not.toBeCalled();
        expect(res.send).not.toBeCalled();
        expect(nextCalled).toBe(true);
    })

    
});