import { DailyNewsContent } from "../schemas/validation.schemas";

export class DailyNewsletterTemplate {
    static formatHTML(content: DailyNewsContent): string {
        return `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Daily Economic Digest - ${content.title}</title>
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
                    
                    <!-- Header with daily theme -->
                    <div style="background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); padding: 40px 30px; text-align: center; position: relative;">
                        <div style="position: absolute; top: 10px; right: 20px; background-color: rgba(255, 255, 255, 0.2); padding: 8px 16px; border-radius: 20px; font-size: 12px; color: #ffffff; font-weight: 600;">
                            DAILY DIGEST
                        </div>
                        <div style="background-color: rgba(255, 255, 255, 0.1); border-radius: 50%; width: 80px; height: 80px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
                            <span style="font-size: 40px; color: #ffffff;">📰</span>
                        </div>
                        <h1 style="color: #ffffff; font-size: 28px; font-weight: 700; margin: 0 0 10px; text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
                            Daily Economic Digest
                        </h1>
                        <p style="color: rgba(255, 255, 255, 0.9); font-size: 16px; margin: 0;">
                            ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                    </div>

                    <!-- Daily Summary -->
                    <div style="padding: 30px 30px 20px;">
                        <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-radius: 12px; padding: 25px; margin-bottom: 30px; border-left: 5px solid #f59e0b;">
                            <h2 style="color: #92400e; font-size: 20px; font-weight: 600; margin: 0 0 15px; display: flex; align-items: center;">
                                <span style="margin-right: 10px;">☀️</span>
                                Today's Overview
                            </h2>
                            <p style="color: #78350f; margin: 0; font-size: 15px; line-height: 1.6;">
                                ${content.summary}
                            </p>
                        </div>
                    </div>

                    <!-- Top Stories Section -->
                    <div style="padding: 0 30px 20px;">
                        <h3 style="color: #1f2937; font-size: 22px; font-weight: 600; margin: 0 0 20px; border-left: 4px solid #dc2626; padding-left: 16px;">
                            🔥 Top Stories
                        </h3>
                        <div style="display: grid; gap: 20px;">
                            ${content.topStories.map((story, index) => `
                                <div style="background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%); border-radius: 10px; padding: 20px; border-left: 4px solid #dc2626; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);">
                                    <div style="display: flex; align-items: flex-start; gap: 15px;">
                                        <div style="background-color: #dc2626; color: #ffffff; font-weight: 700; font-size: 14px; padding: 8px 12px; border-radius: 50%; min-width: 40px; text-align: center;">
                                            ${index + 1}
                                        </div>
                                        <div style="flex: 1;">
                                            <div style="background-color: rgba(220, 38, 38, 0.1); color: #7f1d1d; font-size: 12px; font-weight: 600; padding: 4px 8px; border-radius: 4px; display: inline-block; margin-bottom: 8px;">
                                                ${story.category.toUpperCase()}
                                            </div>
                                            <h4 style="color: #7f1d1d; font-size: 16px; font-weight: 600; margin: 0 0 8px; line-height: 1.3;">
                                                ${story.headline}
                                            </h4>
                                            <p style="color: #991b1b; margin: 0 0 12px; font-size: 14px; line-height: 1.5;">
                                                ${story.summary}
                                            </p>
                                            <a href="${story.url}" style="color: #dc2626; text-decoration: none; font-size: 13px; font-weight: 600; border-bottom: 1px solid #dc2626; padding-bottom: 1px;">
                                                Read More →
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    <!-- Market Highlights -->
                    ${content.marketHighlights.length > 0 ? `
                    <div style="padding: 0 30px 20px;">
                        <h3 style="color: #1f2937; font-size: 22px; font-weight: 600; margin: 0 0 20px; border-left: 4px solid #059669; padding-left: 16px;">
                            📈 Market Highlights
                        </h3>
                        <div style="background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border-radius: 10px; padding: 20px; border-left: 4px solid #059669;">
                            <ul style="margin: 0; padding-left: 20px; color: #166534;">
                                ${content.marketHighlights.map(highlight => `
                                    <li style="margin-bottom: 12px; font-size: 15px; line-height: 1.5;">
                                        <strong>${highlight}</strong>
                                    </li>
                                `).join('')}
                            </ul>
                        </div>
                    </div>
                    ` : ''}

                    <!-- Economic Indicators -->
                    ${content.economicIndicators.length > 0 ? `
                    <div style="padding: 0 30px 30px;">
                        <h3 style="color: #1f2937; font-size: 22px; font-weight: 600; margin: 0 0 20px; border-left: 4px solid #7c3aed; padding-left: 16px;">
                            📊 Economic Indicators
                        </h3>
                        <div style="background: linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%); border-radius: 10px; padding: 20px; border-left: 4px solid #7c3aed;">
                            <ul style="margin: 0; padding-left: 20px; color: #6b21a8;">
                                ${content.economicIndicators.map(indicator => `
                                    <li style="margin-bottom: 12px; font-size: 15px; line-height: 1.5;">
                                        <strong>${indicator}</strong>
                                    </li>
                                `).join('')}
                            </ul>
                        </div>
                    </div>
                    ` : ''}

                    <!-- Quick Actions -->
                    <div style="padding: 0 30px 40px; text-align: center;">
                        <div style="background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%); border-radius: 12px; padding: 25px; margin-bottom: 20px;">
                            <h3 style="color: #1e40af; font-size: 18px; font-weight: 600; margin: 0 0 15px;">
                                📱 Stay Informed
                            </h3>
                            <div style="display: inline-block;">
                                <a href="https://the-economist.vercel.app/archive" style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; font-size: 14px; margin: 5px; box-shadow: 0 4px 6px rgba(59, 130, 246, 0.25);">
                                    📰 Full Archive
                                </a>
                                <a href="https://the-economist.vercel.app/insights" style="display: inline-block; background: linear-gradient(135deg, #059669 0%, #047857 100%); color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; font-size: 14px; margin: 5px; box-shadow: 0 4px 6px rgba(5, 150, 105, 0.25);">
                                    💡 Market Insights
                                </a>
                            </div>
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
                                You're receiving this daily digest because you subscribed to The Economist Newsletter.
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
                        h3 { font-size: 18px !important; }
                    }
                </style>
            </body>
            </html>
        `;
    }

    static formatText(content: DailyNewsContent): string {
        return `
DAILY ECONOMIC DIGEST - ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}

TODAY'S OVERVIEW:
${content.summary}

TOP STORIES:
${content.topStories.map((story, index) => `
${index + 1}. [${story.category.toUpperCase()}] ${story.headline}
${story.summary}
Read more: ${story.url}
`).join('\n')}

${content.marketHighlights.length > 0 ? `
MARKET HIGHLIGHTS:
${content.marketHighlights.map(highlight => `• ${highlight}`).join('\n')}
` : ''}

${content.economicIndicators.length > 0 ? `
ECONOMIC INDICATORS:
${content.economicIndicators.map(indicator => `• ${indicator}`).join('\n')}
` : ''}

--
You're receiving this daily digest because you subscribed to The Economist Newsletter.
Unsubscribe: {{unsubscribe_link}}
        `;
    }
}
