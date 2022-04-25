import {
    ArgumentsHost,
    Catch,
    ExceptionFilter,
    HttpException,
    HttpStatus,
    Inject,
    Logger
} from "@nestjs/common";
import {Request, Response} from "express";
import ErrorsMessages from "./errors.messages";
import {IGenericHttpExceptionResponse, IHttpExceptionResponse} from "./interfaces/i.http.exception.response";
import * as _ from "lodash";

@Catch()
export class ExceptionsFilter implements ExceptionFilter{
    private logger: Logger = new Logger("Exception");
    catch(exception: unknown, host: ArgumentsHost): any {
        const ctx = host.switchToHttp();
        const response: Response = ctx.getResponse<Response>();
        const request: Request = ctx.getRequest<Request>();

        let status: HttpStatus;
        let errorMessage: string;

        if(exception instanceof HttpException){
            status = exception.getStatus();
            const errorResponse = exception.getResponse();
            errorMessage = exception.message || (errorResponse as IHttpExceptionResponse).error;
        }else{
            status = HttpStatus.INTERNAL_SERVER_ERROR;
            errorMessage = ErrorsMessages.INTERNAL_SERVER_ERROR;
        }
        const errorResponse: IGenericHttpExceptionResponse = {
            statusCode: status,
            error: errorMessage,
            path: request.url,
            method: request.method,
            timestamp: new Date()
        };
        this.logger.error(`Response Code: ${errorResponse.statusCode}; Method: ${errorResponse.method}; URL: ${errorResponse.path}`,
            exception['stack'],
            (!_.isNil(request.user))? `User id: ${request.user.id || "Not signed"}`: '');

        response.status(status).json(errorResponse);
    }
}
