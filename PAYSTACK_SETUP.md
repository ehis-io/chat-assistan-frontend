# Paystack Subscription Setup Guide

## Environment Variables Required

Add the following environment variables to your `.env.local` file:

```bash
# Paystack Public Key (Get from Paystack Dashboard)
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxxxxx

# Paystack Pro Plan Code (Create in Paystack Dashboard)
NEXT_PUBLIC_PAYSTACK_PRO_PLAN_CODE=PLN_xxxxxxxxxx
```

## Creating a Subscription Plan in Paystack Dashboard

1. **Log into Paystack Dashboard**: Go to [https://dashboard.paystack.com](https://dashboard.paystack.com)

2. **Navigate to Plans**: 
   - Click on **Settings** in the sidebar
   - Select **Plans**

3. **Create New Plan**:
   - Click **"New Plan"** button
   - Fill in the following details:
     - **Plan Name**: Pro Monthly
     - **Amount**: 10000 (₦10,000 in kobo)
     - **Interval**: Monthly
     - **Currency**: NGN
     - **Send invoices**: Yes (recommended)
     - **Invoice Limit**: Leave empty for unlimited billing cycles

4. **Save and Copy Plan Code**:
   - Click **"Create Plan"**
   - Copy the generated `plan_code` (starts with `PLN_`)
   - Add it to your `.env.local` file as `NEXT_PUBLIC_PAYSTACK_PRO_PLAN_CODE`

## How It Works

When a user clicks "Go Pro" on the pricing page:

1. The `PaystackInline` component initializes with the plan code
2. Paystack automatically:
   - Charges the customer ₦10,000
   - Creates a subscription
   - Stores the card authorization for future recurring charges
3. Every month, Paystack automatically charges the customer's card
4. You receive webhook notifications for each charge attempt

## Testing

Use Paystack test cards for testing subscriptions:

- **Successful Card**: `4084084084084081`
- **CVV**: Any 3 digits
- **Expiry**: Any future date
- **PIN**: `0000`

## Webhook Events (Future Implementation)

To handle subscription lifecycle events, set up webhooks for:

- `subscription.create` - Subscription successfully created
- `charge.success` - Recurring payment successful
- `invoice.payment_failed` - Payment failed
- `subscription.disable` - Subscription cancelled

## Important Notes

⚠️ **Plan Code is Required**: The subscription feature will not work without a valid plan code from Paystack Dashboard.

⚠️ **Test Mode**: Make sure to use test keys and test plan codes during development. Switch to live keys only in production.

⚠️ **Customer Email**: Currently using a placeholder email. Update the `email` prop in `pricing/page.tsx` to use actual customer email from your authentication system.
