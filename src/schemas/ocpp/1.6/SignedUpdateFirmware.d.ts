/* eslint-disable */
/**
 * This file was automatically generated by json-schema-to-typescript.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run json-schema-to-typescript to regenerate this file.
 */

export interface SignedUpdateFirmwareRequest {
  retries?: number;
  retryInterval?: number;
  requestId: number;
  firmware: FirmwareType;
}
export interface FirmwareType {
  location: string;
  retrieveDateTime: string;
  installDateTime?: string;
  signingCertificate: string;
  signature: string;
}
