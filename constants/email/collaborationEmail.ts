import { CollaborationInvite } from "@/types";

export function generateCollaborationEmail({ userName, inviterName, canvasName, canvasLink }: CollaborationInvite): string {
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
            background-color: #34a853;
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
          .invite-details {
            margin: 20px 0;
            background-color: #f8f9fa;
            padding: 15px;
            border-radius: 5px;
          }
          .button {
            display: inline-block;
            background-color: #34a853;
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
          <h2>Collaboration Invitation 👥</h2>
        </div>
        <div class="content">
          <p>Hello ${userName},</p>
          <p><strong>${inviterName}</strong> has invited you to collaborate on a canvas in Campus Connect!</p>
          
          <div class="invite-details">
            <p><strong>Canvas Name:</strong> ${canvasName}</p>
            <p>You can now access this canvas and collaborate with the team.</p>
          </div>
          
          <p>Click the button below to access the canvas:</p>
          <a href="${canvasLink}" class="button">Open Canvas</a>
          
          <div class="footer">
            <p>Happy collaborating!<br>The Campus Connect Team</p>
          </div>
        </div>
      </body>
    </html>
  `;
}
