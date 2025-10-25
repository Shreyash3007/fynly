/**
 * Email Service Integration (Resend)
 * Send transactional emails for bookings, confirmations, etc.
 */

import { Resend } from 'resend'

// Lazy initialization to avoid build-time errors
let resendInstance: Resend | null = null
const getResend = () => {
  if (!resendInstance) {
    resendInstance = new Resend(process.env.RESEND_API_KEY)
  }
  return resendInstance
}

/**
 * Send booking confirmation email to investor
 */
export async function sendBookingConfirmationEmail(params: {
  to: string
  investorName: string
  advisorName: string
  meetingTime: string
  meetingLink: string
  amount: number
}) {
  const { to, investorName, advisorName, meetingTime, meetingLink, amount } = params

  return await getResend().emails.send({
    from: process.env.NEXT_PUBLIC_EMAIL_FROM || 'Fynly <noreply@fynly.com>',
    to,
    subject: 'Booking Confirmed - Your Meeting with ' + advisorName,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Inter, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #0ea5e9; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; background: #0ea5e9; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
            .details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Booking Confirmed! 🎉</h1>
            </div>
            <div class="content">
              <p>Hi ${investorName},</p>
              <p>Your consultation with <strong>${advisorName}</strong> has been confirmed.</p>
              
              <div class="details">
                <h3>Meeting Details</h3>
                <p><strong>Advisor:</strong> ${advisorName}</p>
                <p><strong>Time:</strong> ${new Date(meetingTime).toLocaleString()}</p>
                <p><strong>Amount Paid:</strong> ₹${amount.toFixed(2)}</p>
              </div>

              <p>Join your meeting using the link below:</p>
              <a href="${meetingLink}" class="button">Join Video Call</a>

              <p style="margin-top: 30px; font-size: 14px; color: #666;">
                Need help? Contact us at support@fynly.com
              </p>
            </div>
          </div>
        </body>
      </html>
    `,
  })
}

/**
 * Send booking notification to advisor
 */
export async function sendAdvisorBookingNotification(params: {
  to: string
  advisorName: string
  investorName: string
  meetingTime: string
  meetingLink: string
  amount: number
}) {
  const { to, advisorName, investorName, meetingTime, meetingLink, amount } = params

  return await getResend().emails.send({
    from: process.env.NEXT_PUBLIC_EMAIL_FROM || 'Fynly <noreply@fynly.com>',
    to,
    subject: 'New Booking - Meeting with ' + investorName,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Inter, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #10b981; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
            .details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>New Booking Received! 💼</h1>
            </div>
            <div class="content">
              <p>Hi ${advisorName},</p>
              <p>You have a new consultation booked with <strong>${investorName}</strong>.</p>
              
              <div class="details">
                <h3>Booking Details</h3>
                <p><strong>Client:</strong> ${investorName}</p>
                <p><strong>Time:</strong> ${new Date(meetingTime).toLocaleString()}</p>
                <p><strong>Earning:</strong> ₹${(amount * 0.9).toFixed(2)} (after 10% commission)</p>
              </div>

              <a href="${meetingLink}" class="button">View in Dashboard</a>

              <p style="margin-top: 30px; font-size: 14px; color: #666;">
                Prepare for your consultation and deliver excellent service!
              </p>
            </div>
          </div>
        </body>
      </html>
    `,
  })
}

/**
 * Send advisor approval email
 */
export async function sendAdvisorApprovalEmail(params: {
  to: string
  advisorName: string
  approved: boolean
  reason?: string
}) {
  const { to, advisorName, approved, reason } = params

  return await getResend().emails.send({
    from: process.env.NEXT_PUBLIC_EMAIL_FROM || 'Fynly <noreply@fynly.com>',
    to,
    subject: approved ? 'Welcome to Fynly - Profile Approved!' : 'Fynly Application Update',
    html: approved
      ? `
        <!DOCTYPE html>
        <html>
          <body style="font-family: Inter, sans-serif; padding: 20px;">
            <h1 style="color: #10b981;">Congratulations ${advisorName}! 🎉</h1>
            <p>Your advisor profile has been approved. You can now start receiving bookings from investors.</p>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/advisor/dashboard" style="display: inline-block; background: #0ea5e9; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px;">
              Go to Dashboard
            </a>
          </body>
        </html>
      `
      : `
        <!DOCTYPE html>
        <html>
          <body style="font-family: Inter, sans-serif; padding: 20px;">
            <h1 style="color: #ef4444;">Application Update</h1>
            <p>Hi ${advisorName},</p>
            <p>Thank you for applying to be an advisor on Fynly. Unfortunately, we cannot approve your application at this time.</p>
            ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
            <p>If you have questions, please contact us at support@fynly.com</p>
          </body>
        </html>
      `,
  })
}

/**
 * Send review reminder email
 */
export async function sendReviewReminderEmail(params: {
  to: string
  investorName: string
  advisorName: string
  bookingId: string
}) {
  const { to, investorName, advisorName, bookingId } = params

  return await getResend().emails.send({
    from: process.env.NEXT_PUBLIC_EMAIL_FROM || 'Fynly <noreply@fynly.com>',
    to,
    subject: 'How was your consultation with ' + advisorName + '?',
    html: `
      <!DOCTYPE html>
      <html>
        <body style="font-family: Inter, sans-serif; padding: 20px;">
          <h2>Hi ${investorName},</h2>
          <p>We hope your consultation with <strong>${advisorName}</strong> was helpful!</p>
          <p>Your feedback helps other investors find the right advisors. Please take a moment to leave a review.</p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/bookings/${bookingId}/review" style="display: inline-block; background: #0ea5e9; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px;">
            Leave a Review
          </a>
        </body>
      </html>
    `,
  })
}

