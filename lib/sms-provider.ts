// SMS/WhatsApp Provider Integration
// This module handles sending verification codes via SMS or WhatsApp
// You can integrate with services like Twilio, MessageBird, Vonage, etc.

interface SMSProviderConfig {
  provider: "twilio" | "messagebird" | "vonage" | "mock"
  apiKey?: string
  apiSecret?: string
  fromNumber?: string
}

interface SendSMSParams {
  to: string
  message: string
  method: "sms" | "whatsapp"
}

// Mock provider for development
class MockSMSProvider {
  async send({
    to,
    message,
    method,
  }: SendSMSParams): Promise<{ success: boolean; messageId?: string; error?: string }> {
    console.log(`[v0] [MockSMS] Sending ${method} to ${to}:`)
    console.log(`[v0] [MockSMS] Message: ${message}`)

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Simulate success
    return {
      success: true,
      messageId: `mock_${Date.now()}`,
    }
  }
}

// Twilio provider implementation
class TwilioProvider {
  private accountSid: string
  private authToken: string
  private fromNumber: string

  constructor(config: SMSProviderConfig) {
    this.accountSid = config.apiKey || process.env.TWILIO_ACCOUNT_SID || ""
    this.authToken = config.apiSecret || process.env.TWILIO_AUTH_TOKEN || ""
    this.fromNumber = config.fromNumber || process.env.TWILIO_PHONE_NUMBER || ""
  }

  async send({
    to,
    message,
    method,
  }: SendSMSParams): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      // Twilio API endpoint
      const url = `https://api.twilio.com/2010-04-01/Accounts/${this.accountSid}/Messages.json`

      const body = new URLSearchParams({
        To: method === "whatsapp" ? `whatsapp:${to}` : to,
        From: method === "whatsapp" ? `whatsapp:${this.fromNumber}` : this.fromNumber,
        Body: message,
      })

      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Basic ${Buffer.from(`${this.accountSid}:${this.authToken}`).toString("base64")}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: body.toString(),
      })

      if (!response.ok) {
        const error = await response.json()
        return {
          success: false,
          error: error.message || "Error al enviar el mensaje",
        }
      }

      const data = await response.json()
      return {
        success: true,
        messageId: data.sid,
      }
    } catch (error) {
      console.error("[v0] Error sending SMS via Twilio:", error)
      return {
        success: false,
        error: "Error al conectar con el servicio de SMS",
      }
    }
  }
}

// Main SMS Service
export class SMSService {
  private provider: MockSMSProvider | TwilioProvider

  constructor(config?: SMSProviderConfig) {
    const providerType = config?.provider || process.env.SMS_PROVIDER || "mock"

    switch (providerType) {
      case "twilio":
        this.provider = new TwilioProvider(config || {})
        break
      case "mock":
      default:
        this.provider = new MockSMSProvider()
        break
    }
  }

  async sendVerificationCode(
    phoneNumber: string,
    code: string,
    method: "sms" | "whatsapp" = "sms",
  ): Promise<{ success: boolean; error?: string }> {
    const message = `Tu código de verificación de Giros Max es: ${code}. Este código expira en 10 minutos.`

    const result = await this.provider.send({
      to: phoneNumber,
      message,
      method,
    })

    return {
      success: result.success,
      error: result.error,
    }
  }

  async sendKYCApprovalNotification(phoneNumber: string): Promise<{ success: boolean; error?: string }> {
    const message = `¡Tu cuenta de Giros Max ha sido verificada! Ahora puedes realizar transacciones sin límites.`

    const result = await this.provider.send({
      to: phoneNumber,
      message,
      method: "whatsapp",
    })

    return {
      success: result.success,
      error: result.error,
    }
  }

  async sendKYCRejectionNotification(
    phoneNumber: string,
    reason: string,
  ): Promise<{ success: boolean; error?: string }> {
    const message = `Tu verificación de Giros Max ha sido rechazada. Motivo: ${reason}. Por favor, intenta nuevamente con documentos válidos.`

    const result = await this.provider.send({
      to: phoneNumber,
      message,
      method: "whatsapp",
    })

    return {
      success: result.success,
      error: result.error,
    }
  }
}

// Export singleton instance
export const smsService = new SMSService()
