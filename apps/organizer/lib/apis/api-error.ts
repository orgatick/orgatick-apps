import axios, { type AxiosError } from "axios";
import { toast } from "sonner";

export interface ApiErrorResponse {
  message?: string;
  error?: string;
  code?: string;
  errors?: Record<string, string[]> | string[];
  statusCode?: number;
  requiresVerification?: boolean;
}

export function isEmailUnverifiedError(error: unknown): boolean {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as ApiErrorResponse | undefined;
    if (data?.requiresVerification) return true;
    if (data?.code === "EMAIL_NOT_VERIFIED" || data?.code === "UNVERIFIED_EMAIL") return true;

    const message = (data?.message || data?.error || "").toLowerCase();
    if (message.includes("verify your email") || message.includes("unverified email")) {
      return true;
    }
  }

  if (error instanceof Error) {
    const msg = error.message.toLowerCase();
    return msg.includes("verify your email") || msg.includes("unverified email");
  }

  return false;
}

const HTTP_ERROR_MESSAGES: Record<number, string> = {
  400: "Invalid request. Please check the entered details.",
  401: "Authentication failed. Please check your credentials.",
  403: "You do not have permission to perform this action.",
  404: "Requested resource was not found.",
  409: "A conflict occurred. This record may already exist.",
  422: "Validation failed. Please verify your input.",
  429: "Too many requests. Please slow down and try again later.",
  500: "Server error. Please try again in a few moments.",
  502: "Server error. Please try again in a few moments.",
  503: "Server error. Please try again in a few moments.",
};

export function getApiErrorMessage(
  error: unknown,
  fallbackMessage = "An unexpected error occurred. Please try again.",
): string {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    const responseData = axiosError.response?.data;

    if (responseData?.message && typeof responseData.message === "string") {
      return responseData.message;
    }

    if (responseData?.error && typeof responseData.error === "string") {
      return responseData.error;
    }

    if (responseData?.errors) {
      if (Array.isArray(responseData.errors) && responseData.errors[0]) {
        return String(responseData.errors[0]);
      }
      if (typeof responseData.errors === "object" && responseData.errors !== null) {
        const errorRecord = responseData.errors as Record<string, string[] | string>;
        const firstKey = Object.keys(errorRecord)[0];
        if (firstKey) {
          const fieldErrors = errorRecord[firstKey];
          if (Array.isArray(fieldErrors) && fieldErrors[0]) return fieldErrors[0];
          if (typeof fieldErrors === "string") return fieldErrors;
        }
      }
    }

    if (axiosError.response?.status && HTTP_ERROR_MESSAGES[axiosError.response.status]) {
      return HTTP_ERROR_MESSAGES[axiosError.response.status];
    }

    if (axiosError.code === "ECONNABORTED") {
      return "Request timed out. Please check your internet connection.";
    }

    if (axiosError.message === "Network Error") {
      return "Network error. Please check your internet connection.";
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallbackMessage;
}

export function handleApiError(
  error: unknown,
  fallbackMessage?: string,
  options?: { showToast?: boolean; toastId?: string | number },
): string {
  const message = getApiErrorMessage(error, fallbackMessage);

  if (options?.showToast !== false) {
    toast.error(message, {
      id: options?.toastId,
      duration: 4000,
    });
  }

  return message;
}
