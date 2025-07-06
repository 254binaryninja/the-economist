import { WelcomeUser } from "@/types";

export function generateWelcomeEmail({
  userName,
  dashboardLink,
}: WelcomeUser): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background-color: #4285f4;
            padding: 20px;
            border-radius: 5px;
            margin-bottom: 20px;
            color: white;
          }
          .content {
            background-color: #ffffff;
            padding: 20px;
            border: 1px solid #dee2e6;
            border-radius: 5px;
          }
          .welcome-message {
            font-size: 18px;
            margin-bottom: 20px;
          }
          .button {
            display: inline-block;
            background-color: #4285f4;
            color: white;
            padding: 10px 20px;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
          }
          .footer {
            margin-top: 30px;
            font-size: 14px;
            color: #6c757d;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h2>Welcome to Campus Connect! 🎓</h2>
        </div>
        <div class="content">
          <div class="welcome-message">
            <p>Hello ${userName},</p>
            <p>Thank you for joining Campus Connect! We're excited to have you as part of our community.</p>
          </div>
          <p>Get started by visiting your dashboard to explore all the features available to you:</p>
          <a href="${dashboardLink}" class="button">Go to Dashboard</a>
          <p>If you have any questions or need assistance, feel free to contact our support team.</p>
          <div class="footer">
            <p>Best regards,<br>The Campus Connect Team</p>
          </div>
        </div>
      </body>
    </html>
  `;
}
