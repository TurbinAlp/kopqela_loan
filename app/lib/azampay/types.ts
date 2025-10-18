// Azampay API Types and Interfaces

export enum MobileMoneyProvider {
  AZAMPESA = 'Azampesa',
  TIGOPESA = 'Tigopesa',
  AIRTEL = 'Airtel',
  HALOPESA = 'Halopesa',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED',
}

export interface AzampayConfig {
  appName: string
  clientId: string
  clientSecret: string
  apiKey: string
  baseUrl: string
  callbackUrl: string
  env: 'sandbox' | 'production'
}

export interface AzampayAuthResponse {
  data: {
    accessToken: string
    expire: string
  }
  message: string
  statusCode: number
  success: boolean
}

export interface MobileCheckoutRequest {
  accountNumber: string // Phone number
  amount: string
  currency: string
  externalId: string // Our internal reference
  provider: MobileMoneyProvider
  additionalProperties?: {
    [key: string]: string
  }
}

export interface MobileCheckoutResponse {
  data: string // Transaction ID
  message: string
  statusCode: number
  success: boolean
}

export interface PaymentStatusResponse {
  data: {
    transactionId: string
    status: string
    amount: string
    currency: string
    provider: string
    externalId: string
    reason?: string
  }
  message: string
  statusCode: number
  success: boolean
}

export interface AzampayWebhookPayload {
  transactionId: string
  status: string
  amount: string
  currency: string
  provider: string
  externalId: string
  reason?: string
  timestamp: string
}

export interface AzampayError {
  message: string
  statusCode: number
  error?: string
}


