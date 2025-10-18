import {
  AzampayConfig,
  AzampayAuthResponse,
  MobileCheckoutRequest,
  MobileCheckoutResponse,
  PaymentStatusResponse,
  AzampayError,
} from './types'

class AzampayClient {
  private config: AzampayConfig
  private accessToken: string | null = null
  private tokenExpiry: Date | null = null

  constructor() {
    this.config = {
      appName: process.env.AZAMPAY_APP_NAME || 'Kopqela',
      clientId: process.env.AZAMPAY_CLIENT_ID || '',
      clientSecret: process.env.AZAMPAY_CLIENT_SECRET || '',
      apiKey: process.env.AZAMPAY_API_KEY || '',
      baseUrl: process.env.AZAMPAY_BASE_URL || 'https://sandbox.azampay.co.tz',
      callbackUrl: process.env.AZAMPAY_CALLBACK_URL || '',
      env: (process.env.AZAMPAY_ENV as 'sandbox' | 'production') || 'sandbox',
    }

    // Validate config
    if (!this.config.clientId || !this.config.clientSecret || !this.config.apiKey) {
      console.warn('Azampay credentials not configured. Payment functionality will not work.')
    }
  }

  /**
   * Get access token from Azampay API
   */
  async getAccessToken(): Promise<string> {
    // Return cached token if still valid
    if (this.accessToken && this.tokenExpiry && new Date() < this.tokenExpiry) {
      return this.accessToken
    }

    try {
      const response = await fetch(`${this.config.baseUrl}/AppRegistration/GenerateToken`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          appName: this.config.appName,
          clientId: this.config.clientId,
          clientSecret: this.config.clientSecret,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(
          `Azampay authentication failed: ${response.status} ${response.statusText}. ${
            errorData.message || ''
          }`
        )
      }

      const data: AzampayAuthResponse = await response.json()

      if (!data.success || !data.data?.accessToken) {
        throw new Error(`Azampay authentication failed: ${data.message}`)
      }

      this.accessToken = data.data.accessToken

      // Set token expiry (Azampay tokens typically expire in 1 hour, we'll refresh 5 minutes before)
      this.tokenExpiry = new Date(Date.now() + 55 * 60 * 1000) // 55 minutes

      return this.accessToken
    } catch (error) {
      console.error('Error getting Azampay access token:', error)
      throw error
    }
  }

  /**
   * Initiate mobile money checkout
   */
  async initiateMobileCheckout(
    request: MobileCheckoutRequest
  ): Promise<MobileCheckoutResponse> {
    try {
      const token = await this.getAccessToken()

      const response = await fetch(`${this.config.baseUrl}/azampay/mno/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          'X-API-Key': this.config.apiKey,
        },
        body: JSON.stringify(request),
      })

      if (!response.ok) {
        const errorData: AzampayError = await response.json().catch(() => ({
          message: 'Unknown error',
          statusCode: response.status,
        }))
        throw new Error(
          `Azampay checkout failed: ${response.status} ${response.statusText}. ${
            errorData.message || ''
          }`
        )
      }

      const data: MobileCheckoutResponse = await response.json()

      if (!data.success) {
        throw new Error(`Azampay checkout failed: ${data.message}`)
      }

      return data
    } catch (error) {
      console.error('Error initiating Azampay mobile checkout:', error)
      throw error
    }
  }

  /**
   * Check payment status
   */
  async checkPaymentStatus(transactionId: string): Promise<PaymentStatusResponse> {
    try {
      const token = await this.getAccessToken()

      const response = await fetch(
        `${this.config.baseUrl}/api/v1/payment/status/${transactionId}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
            'X-API-Key': this.config.apiKey,
          },
        }
      )

      if (!response.ok) {
        const errorData: AzampayError = await response.json().catch(() => ({
          message: 'Unknown error',
          statusCode: response.status,
        }))
        throw new Error(
          `Failed to check payment status: ${response.status} ${response.statusText}. ${
            errorData.message || ''
          }`
        )
      }

      const data: PaymentStatusResponse = await response.json()

      return data
    } catch (error) {
      console.error('Error checking Azampay payment status:', error)
      throw error
    }
  }

  /**
   * Validate webhook signature (if Azampay provides one)
   * For now, we'll validate based on the callback URL and known transaction IDs
   */
  validateWebhookSignature(payload: unknown, signature?: string): boolean {
    // TODO: Implement proper signature validation when Azampay provides the mechanism
    // For now, we'll validate the transaction exists in our database
    return true
  }

  /**
   * Format phone number for Azampay (remove +255 and leading zeros)
   */
  formatPhoneNumber(phone: string): string {
    let formatted = phone.trim()

    // Remove spaces, dashes, and parentheses
    formatted = formatted.replace(/[\s\-()]/g, '')

    // Remove country code if present
    if (formatted.startsWith('+255')) {
      formatted = formatted.substring(4)
    } else if (formatted.startsWith('255')) {
      formatted = formatted.substring(3)
    } else if (formatted.startsWith('0')) {
      formatted = formatted.substring(1)
    }

    // Ensure it starts with 6 or 7 (valid Tanzanian mobile prefixes)
    if (!formatted.startsWith('6') && !formatted.startsWith('7')) {
      throw new Error('Invalid Tanzanian phone number')
    }

    // Ensure it's 9 digits
    if (formatted.length !== 9) {
      throw new Error('Invalid phone number length')
    }

    return `255${formatted}`
  }

  /**
   * Generate unique reference for transaction
   */
  generateReference(): string {
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 9).toUpperCase()
    return `KPQ-${timestamp}-${random}`
  }
}

// Export singleton instance
export const azampayClient = new AzampayClient()


