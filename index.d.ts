export type NestedErrorLike = Error & { nested?: NestedErrorLike };

export type SerializableError = Error | NestedErrorLike | Record<string, any>;

export interface SerializedErrorPayload {
  type?: "NestedError" | "Error" | "Object" | "Default" | string;
  message?: string;
  stack?: string;
  nested?: SerializedErrorPayload;
  [key: string]: any;
}

export function serializeError(
  error: SerializableError | null | undefined,
  sanitize?: boolean,
  properties?: string[]
): SerializedErrorPayload | null | undefined;

export function deserializeError(
  json: SerializedErrorPayload | null | undefined
): SerializableError | null | undefined;

export function serializedErrorText(
  json: SerializedErrorPayload | null | undefined,
  level?: number
): string;

export function errorText(error: SerializableError | null | undefined): string;

export function debugSerializedError(
  json: SerializedErrorPayload | null | undefined
): string;

export function debugError(error: SerializableError | null | undefined): string;
