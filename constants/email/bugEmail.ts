import { BugReport } from "@/types";


export function generateBugReportEmail({ userName, briefDescription, completeDescription }: BugReport): string {
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
              background-color: #f8f9fa;
              padding: 20px;
              border-radius: 5px;
              margin-bottom: 20px;
            }
            .content {
              background-color: #ffffff;
              padding: 20px;
              border: 1px solid #dee2e6;
              border-radius: 5px;
            }
            .bug-section {
              margin-bottom: 20px;
            }
            .bug-title {
              color: #dc3545;
              font-weight: bold;
              margin-bottom: 10px;
            }
            .user-info {
              color: #6c757d;
              font-style: italic;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>🐛 Bug Report</h2>
          </div>
          <div class="content">
            <div class="user-info">
              <p>Reported by: ${userName}</p>
            </div>
            <div class="bug-section">
              <div class="bug-title">Brief Description:</div>
              <p>${briefDescription}</p>
            </div>
            <div class="bug-section">
              <div class="bug-title">Complete Description:</div>
              <p>${completeDescription}</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }