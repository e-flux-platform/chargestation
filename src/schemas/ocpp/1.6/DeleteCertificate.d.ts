/* eslint-disable */
/**
 * This file was automatically generated by json-schema-to-typescript.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run json-schema-to-typescript to regenerate this file.
 */

export type HashAlgorithmEnumType = 'SHA256' | 'SHA384' | 'SHA512';

export interface DeleteCertificateRequest {
  certificateHashData: CertificateHashDataType;
}
export interface CertificateHashDataType {
  hashAlgorithm: HashAlgorithmEnumType;
  issuerNameHash: string;
  issuerKeyHash: string;
  serialNumber: string;
}
