import { NewsletterContent } from "../schemas/validation.schemas";

export class NewsletterTemplate {
    static formatHTML(content: NewsletterContent): string {
        return `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>${content.title}</title>
                <!--[if mso]>
                <noscript>
                    <xml>
                        <o:OfficeDocumentSettings>
                            <o:PixelsPerInch>96</o:PixelsPerInch>
                        </o:OfficeDocumentSettings>
                    </xml>
                </noscript>
                <![endif]-->
            </head>
            <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; background-color: #f8fafc; line-height: 1.6;">
                <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                    
                    <!-- Header with gradient -->
                    <div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); padding: 40px 30px; text-align: center;">
                        <div style="background-color: rgba(255, 255, 255, 0.1); border-radius: 50%; width: 80px; height: 80px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
                            <span style="font-size: 40px; color: #ffffff;">📊</span>
                        </div>
                        <h1 style="color: #ffffff; font-size: 28px; font-weight: 700; margin: 0; text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
                            The Economist Newsletter
                        </h1>
                        <p style="color: rgba(255, 255, 255, 0.9); font-size: 16px; margin: 10px 0 0;">
                            ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                    </div>

                    <!-- Main content -->
                    <div style="padding: 40px 30px;">
                        <h2 style="color: #1f2937; font-size: 24px; font-weight: 600; margin: 0 0 20px; line-height: 1.3; border-left: 4px solid #3b82f6; padding-left: 16px;">
                            ${content.title}
                        </h2>
                        
                        <div style="color: #4b5563; font-size: 16px; line-height: 1.7; margin-bottom: 30px;">
                            ${content.content}
                        </div>

                        ${content.summary ? `
                        <div style="background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%); border-left: 4px solid #10b981; padding: 24px; margin: 30px 0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);">
                            <h3 style="color: #059669; font-size: 18px; font-weight: 600; margin: 0 0 12px; display: flex; align-items: center;">
                                <span style="margin-right: 8px;">💡</span>
                                Key Insights
                            </h3>
                            <p style="color: #374151; margin: 0; font-size: 15px; line-height: 1.6;">
                                ${content.summary}
                            </p>
                        </div>
                        ` : ''}

                        <!-- Call to action -->
                        <div style="text-align: center; margin: 40px 0;">
                            <a href="#" style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(59, 130, 246, 0.25); transition: all 0.3s ease;">
                                📈 Read Full Analysis
                            </a>
                        </div>
                    </div>

                    <!-- Footer -->
                    <div style="background-color: #f8fafc; padding: 30px; border-top: 1px solid #e5e7eb;">
                        <div style="text-align: center; margin-bottom: 20px;">
                            <h3 style="color: #374151; font-size: 18px; margin: 0 0 15px;">Stay Connected</h3>
                            <div style="display: inline-block;">
                                <a href="https://the-economist.vercel.app" style="display: inline-block; margin: 0 10px; color: #6b7280; text-decoration: none; font-size: 14px; padding: 8px 12px; border-radius: 6px; background-color: #ffffff; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);">
                                    🌐 Website
                                </a>
                                <a href="https://twitter.com/TheEconomist" style="display: inline-block; margin: 0 10px; color: #6b7280; text-decoration: none; font-size: 14px; padding: 8px 12px; border-radius: 6px; background-color: #ffffff; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);">
                                    📱 Twitter
                                </a>
                                <a href="https://www.linkedin.com/company/the-economist" style="display: inline-block; margin: 0 10px; color: #6b7280; text-decoration: none; font-size: 14px; padding: 8px 12px; border-radius: 6px; background-color: #ffffff; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);">
                                    💼 LinkedIn
                                </a>
                            </div>
                        </div>
                        
                        <div style="text-align: center; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                            <p style="color: #6b7280; font-size: 13px; margin: 0 0 10px;">
                                You're receiving this because you subscribed to The Economist Newsletter.
                            </p>
                            <p style="margin: 0;">
                                <a href="{{unsubscribe_link}}" style="color: #9ca3af; text-decoration: underline; font-size: 12px;">
                                    Unsubscribe
                                </a>
                                <span style="color: #d1d5db; margin: 0 8px;">|</span>
                                <a href="#" style="color: #9ca3af; text-decoration: underline; font-size: 12px;">
                                    Update Preferences
                                </a>
                            </p>
                        </div>
                    </div>
                </div>

                <!-- Mobile responsiveness -->
                <style>
                    @media only screen and (max-width: 600px) {
                        .container { width: 100% !important; }
                        .content { padding: 20px !important; }
                        .header { padding: 30px 20px !important; }
                        .footer { padding: 20px !important; }
                        h1 { font-size: 24px !important; }
                        h2 { font-size: 20px !important; }
                    }
                </style>
            </body>
            </html>
        `;
    }

    static formatText(content: NewsletterContent): string {
        return `
            ${content.title}
            
            ${content.content.replace(/<[^>]*>/g, '')}
            
            ${content.summary ? `Summary: ${content.summary}` : ''}
            
            --
            You're receiving this because you subscribed to The Economist Newsletter.
            Unsubscribe: {{unsubscribe_link}}
        `;
    }
}
