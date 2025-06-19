import nodemailer from 'nodemailer';
import { User } from './data'; // Assuming User interface is in data.ts
import { Test } from './api/test-api'; // Assuming Test interface is in test-api.ts

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

async function sendEmail(options: EmailOptions): Promise<void> {
  // Configure Nodemailer transporter
  // IMPORTANT: Replace with actual email service configuration (e.g., SMTP details or service like SendGrid/Mailgun)
  // For demonstration, this uses ethereal.email, which creates a test account.
  // You'll need to replace this with your actual email sending configuration.
  const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
      user: 'YOUR_ETHEREAL_USER', // Replace with Ethereal username
      pass: 'YOUR_ETHEREAL_PASSWORD' // Replace with Ethereal password
    }
  });

  try {
    await transporter.sendMail({
      from: '"AI Interview Platform" <noreply@example.com>', // Sender address
      to: options.to,
      subject: options.subject,
      html: options.html,
    });
    console.log('Email sent successfully to:', options.to);
    // For Ethereal, a preview URL will be logged if you don't have real SMTP creds
    // console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send email');
  }
}

export async function sendTestInvitationEmail(candidate: User, test: Test): Promise<void> {
  const activationLink = `https://ai-interview-web-home-749e.vercel.app/chat?code=${test.activate_code}`;
  const subject = 'Your AI Interview Invitation';
  const htmlContent = `
    <p>Dear ${candidate.name},</p>
    <p>You have been invited to take an AI interview.</p>
    <p>Your activation code is: <strong>${test.activate_code}</strong></p>
    <p>Please click on the following link to start your interview:</p>
    <p><a href="${activationLink}">${activationLink}</a></p>
    <p>The test is valid from ${new Date(test.start_date).toLocaleString()} to ${new Date(test.expire_date).toLocaleString()}.</p>
    <p>Good luck!</p>
    <p>Best regards,</p>
    <p>The AI Interview Platform Team</p>
  `;

  await sendEmail({
    to: candidate.email,
    subject: subject,
    html: htmlContent,
  });
}
