import { CollaborationRoleChange } from "@/types";

export function generateCollaborationRoleEmail({
  userName,
  canvasName,
  newRole,
  changedBy,
  canvasLink,
}: CollaborationRoleChange): string {
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
            background-color: #fbbc05;
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
          .role-details {
            margin: 20px 0;
            background-color: #f8f9fa;
            padding: 15px;
            border-radius: 5px;
          }
          .role-highlight {
            font-weight: bold;
            color: #34a853;
          }
          .button {
            display: inline-block;
            background-color: #fbbc05;
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
          <h2>Collaboration Role Update 🔄</h2>
        </div>
        <div class="content">
          <p>Hello ${userName},</p>
          <p>Your role has been updated in a collaborative canvas on Campus Connect.</p>
          
          <div class="role-details">
            <p><strong>Canvas:</strong> ${canvasName}</p>
            <p><strong>Your new role:</strong> <span class="role-highlight">${newRole}</span></p>
            <p><strong>Changed by:</strong> ${changedBy}</p>
          </div>
          
          <p>This change may affect your permissions within the canvas. To view the canvas and your updated capabilities:</p>
          <a href="${canvasLink}" class="button">View Canvas</a>
          
          <div class="footer">
            <p>If you have any questions about this change, please contact the canvas owner or our support team.</p>
            <p>Best regards,<br>The Campus Connect Team</p>
          </div>
        </div>
      </body>
    </html>
  `;
}
