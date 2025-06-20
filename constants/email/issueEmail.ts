import { IssueNotification } from "@/types";

export function generateIssueEmail({ userName, issueTitle, issueDescription, actionLink, actionText }: IssueNotification): string {
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
            background-color: #ea4335;
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
          .issue-section {
            margin: 20px 0;
            background-color: #f8f9fa;
            padding: 15px;
            border-radius: 5px;
          }
          .issue-title {
            font-weight: bold;
            margin-bottom: 10px;
            color: #ea4335;
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
          <h2>⚠️ Account Notice</h2>
        </div>
        <div class="content">
          <p>Hello ${userName},</p>
          <p>We need to inform you about an important matter regarding your Campus Connect account:</p>
          
          <div class="issue-section">
            <div class="issue-title">${issueTitle}</div>
            <p>${issueDescription}</p>
          </div>
          
          ${actionLink ? `<a href="${actionLink}" class="button">${actionText || 'Take Action'}</a>` : ''}
          
          <p>If you have any questions or need assistance, please contact our support team.</p>
          
          <div class="footer">
            <p>Thank you for your attention to this matter.</p>
            <p>Best regards,<br>The Campus Connect Team</p>
          </div>
        </div>
      </body>
    </html>
  `;
}
