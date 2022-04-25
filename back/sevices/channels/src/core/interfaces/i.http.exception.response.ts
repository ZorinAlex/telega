export interface IHttpExceptionResponse {
    statusCode: number;
    error: string
}

export interface IGenericHttpExceptionResponse extends IHttpExceptionResponse{
    path: string;
    method: string;
    timestamp: Date;
}
