import { ValidationErrorItem, ValidationResult } from 'joi'
import isString from 'lodash/isString'

export interface ApiResponseMessage {
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
}

// export interface IApiResponse<T> {
//   messages?: Array<string | ApiResponseMessage>;
//   data?: T;
//   status?: 'success' | 'error' | 'validation_error';
//   joiPayload?: ValidationResult;
//   redirectTo?: string;
//   reload?: boolean;
// }

export interface IApiResponse {
  messages?: Array<string | ApiResponseMessage>;
  data?: any;
  metadata?: any;
  status?: 'success' | 'error' | 'validation_error';
  joiPayload?: ValidationResult;
  redirectTo?: string;
  reload?: boolean;
}

class ApiResponse {
  public static withMessage(
    message: string,
    options: IApiResponse = {},
  ): ApiResponse {
    return new ApiResponse({
      ...{
        status: 'success',
        ...options,
      },
      messages: [message],
    })
  }

  public static withError(
    message: string,
    options: IApiResponse = {},
  ): ApiResponse {
    return new ApiResponse({
      ...{
        status: 'error',
        ...options,
      },
      messages: [message],
    })
  }

  public static withData(
    data: any,
    options: IApiResponse & { message?: string } = {},
  ) {
    const { message } = options

    if (message) {
      delete options.message
      options.messages = [message]
    }

    return new ApiResponse({
      ...{
        status: 'success',
        ...options,
      },
      data,
    })
  }

  public static withValidation(joiResponse: ValidationResult): ApiResponse {
    if (joiResponse && joiResponse.error) {
      return new ApiResponse({
        status: 'validation_error',
        messages: joiResponse.error.details.map(
          (error: ValidationErrorItem) => ({
            message: error.message,
            type: 'error',
          }),
        ),
      })
    }

    return new ApiResponse({
      messages: ['Something went wrong with validation.'],
    })
  }

  public status: IApiResponse['status'];

  public data: IApiResponse['data'];

  public metadata: IApiResponse['metadata'];

  public messages: IApiResponse['messages'];

  public joiPayload: IApiResponse['joiPayload'];

  public redirectTo: IApiResponse['redirectTo'];

  public reload: IApiResponse['reload'];

  constructor({
    messages,
    data,
    metadata,
    status,
    joiPayload,
    redirectTo,
    reload,
  }: IApiResponse) {
    this.status = status || 'success'
    this.data = data
    this.metadata = metadata
    this.messages = messages || []
    this.joiPayload = joiPayload
    this.redirectTo = redirectTo
    this.reload = reload
  }

  get ok() {
    return this.status === 'success'
  }

  get error() {
    return !this.ok
  }

  toJSON() {
    const response = {
      ...this,
      ok: this.ok,
      error: this.error,
    }
    if (isString(this.messages)) { response.messages = [this.messages] }

    return response
  }
}

export default ApiResponse
