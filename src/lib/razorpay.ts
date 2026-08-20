import Razorpay from 'razorpay';
import crypto from 'crypto';

/**
 * Returns a configured Razorpay SDK instance singleton.
 */
export const getRazorpayInstance = () => {
  const key_id =
    process.env.RAZORPAY_KEY_ID ||
    process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ||
    'rzp_test_TRx1C45SujawMV';

  const key_secret =
    process.env.RAZORPAY_KEY_SECRET || '8Jc0PrlG794sLKwRNFySgHK2';

  return new Razorpay({
    key_id,
    key_secret,
  });
};

/**
 * Verifies the Razorpay payment HMAC-SHA256 signature server-side.
 * Formula: HMAC-SHA256(razorpay_order_id + "|" + razorpay_payment_id, key_secret)
 */
export function verifyRazorpaySignature(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  try {
    const secret = process.env.RAZORPAY_KEY_SECRET || '8Jc0PrlG794sLKwRNFySgHK2';
    const text = `${orderId}|${paymentId}`;
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(text)
      .digest('hex');

    return expectedSignature === signature;
  } catch (err) {
    console.error('Signature verification exception:', err);
    return false;
  }
}

/**
 * Verifies incoming Razorpay Webhook signature (X-Razorpay-Signature)
 */
export function verifyWebhookSignature(
  rawBody: string,
  signature: string,
  secret?: string
): boolean {
  try {
    const webhookSecret =
      secret || process.env.RAZORPAY_WEBHOOK_SECRET || 'houseofnf_webhook_secret_2026';

    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(rawBody)
      .digest('hex');

    return expectedSignature === signature;
  } catch (err) {
    console.error('Webhook signature verification exception:', err);
    return false;
  }
}
