import { type ExpressErrorMiddlewareInterface, Middleware } from 'routing-controllers';
import { KevinErrorType, type KevinError } from '@kevin-infra/core/errors';
import { type Response } from 'express';
import { Service } from 'typedi';

@Middleware({ type: 'after' })
@Service()
export class KevinErrorHandlerMiddleware implements ExpressErrorMiddlewareInterface {
    error(error: any, request: any, response: any, next: (err?: any) => any): void {
        this.handleError(error, response);
        next();
    }


    private handleError(error: any, response: Response): void {

        const kevinError = error as KevinError;

        if (kevinError?.code) {
            switch (kevinError.code) {
                case KevinErrorType.DuplicateEnvironment:
                    response.status(409).send({ message: error.message });
                    return;
                case KevinErrorType.DuplicateKey:
                    response.status(409).send({ message: error.message });
                    return;
                case KevinErrorType.EnvironmentNotFound:
                    response.status(404).send({ message: error.message });
                    return;
                case KevinErrorType.InvalidEnvironmentInfo:
                    response.status(400).send({ message: error.message });
                    return;

            }
        }
            response.status(500).send({ message: error.message });

    }
}