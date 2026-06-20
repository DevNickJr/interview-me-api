export default class CustomError extends Error {
  public status: number;

  constructor(message: string, status: number = 400) {
    super(message);
    this.name = 'CustomError';
    this.status = status;
  }

  static badRequest(message: string) {
    return new CustomError(message, 400);
  }

  static unauthorized(message = 'Unauthorized') {
    return new CustomError(message, 401);
  }

  static forbidden(message = 'Forbidden') {
    return new CustomError(message, 403);
  }

  static notFound(message = 'Not found') {
    return new CustomError(message, 404);
  }
}
