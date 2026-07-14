export class ApiError extends Error {
  public statusCode: number;
  public responseData: any;

  constructor(message: string, statusCode: number, responseData?: any) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.responseData = responseData;
  }
}

export const handleApiError = (error: any): ApiError => {
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    return new ApiError(
      error.response.data?.message || 'An API error occurred',
      error.response.status,
      error.response.data
    );
  } else if (error.request) {
    // The request was made but no response was received
    return new ApiError('No response from server', 0);
  } else {
    // Something happened in setting up the request that triggered an Error
    return new ApiError(error.message || 'Network error', 0);
  }
};
