import {
  Catch,
  ExceptionFilter,
  HttpException,
  ArgumentsHost,
  HttpStatus,
} from '@nestjs/common';

@Catch(HttpException)
export class ForbiddenExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const status = exception.getStatus();

    if (status === HttpStatus.FORBIDDEN) {
      response.status(status).json({
        message: 'Accés non autorisé',
        status: status,
        error: 'Forbidden',
      });
    } else {
      throw exception;
    }
  }
}
