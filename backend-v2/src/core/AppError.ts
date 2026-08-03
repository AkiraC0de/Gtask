export type FieldError = {
  field: string;
  message: string;
};

export type FormError = FieldError[];

export type Errors = FormError

class AppError extends Error {
  public readonly code: number;
  public errors?: Errors;

  constructor(code: number, message: string, errors?: Errors ) {
    super(message); // Call the parent Error class constructor
    this.code = code;
    this.errors = errors;
  }
}

export default AppError