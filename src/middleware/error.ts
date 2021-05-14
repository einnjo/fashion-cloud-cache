import { isBoom, boomify, Boom, Payload } from '@hapi/boom';
import { Request, Response, NextFunction } from 'express';

export function errorMiddleware(err: Error, _req: Request, res: Response, _next: NextFunction) {
    let apiError: Boom;
    if (!isBoom(err)) {
        apiError = wrapError(err);
    } else {
        apiError = err;
    }

    return res.status(apiError.output.statusCode).json(apiError.output.payload);
}

type OpenApiError = { status: number; errors: Array<Record<string, any>> };

function wrapError(err: Error): Boom {
    if (isOpenApiError(err)) {
        return wrapOpenApiError(err);
    }

    return boomify(err);
}

function isOpenApiError(err: any): err is OpenApiError {
    const hasStatusProperty = 'status' in err;
    const hasErrorsProperty = 'errors' in err;

    return hasStatusProperty && hasErrorsProperty;
}

function wrapOpenApiError(err: OpenApiError): Boom {
    const boomified = boomify(new Error('OpenApiError'), {
        statusCode: err.status,
        decorate: { errors: err.errors },
    });
    boomified.output.payload = { ...boomified.output.payload, errors: err.errors } as Payload;

    return boomified;
}
