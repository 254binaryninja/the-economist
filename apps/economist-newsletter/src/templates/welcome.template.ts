export class WelcomeTemplate {
    static formatHTML(name?: string): string {
        return `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Welcome to The Economist Newsletter</title>
            </head>
            <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; background-color: #f8fafc;">
                <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                    
                    <!-- Welcome header with celebration theme -->
                    <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 50px 30px; text-align: center; position: relative; overflow: hidden;">
                        <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background-image: radial-gradient(circle at 20% 50%, rgba(255, 255, 255, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%);"></div>
                        <div style="position: relative; z-index: 1;">
                            <div style="background-color: rgba(255, 255, 255, 0.15); border-radius: 50%; width: 100px; height: 100px; margin: 0 auto 25px; display: flex; align-items: center; justify-content: center; border: 3px solid rgba(255, 255, 255, 0.2);">
                                <span style="font-size: 50px;">🎉</span>
                            </div>
                            <h1 style="color: #ffffff; font-size: 32px; font-weight: 700; margin: 0 0 10px; text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);">
                                Welcome Aboard!
                            </h1>
                            <p style="color: rgba(255, 255, 255, 0.95); font-size: 18px; margin: 0; font-weight: 500;">
                                You're now part of our exclusive community
                            </p>
                        </div>
                    </div>

                    <!-- Personal greeting -->
                    <div style="padding: 40px 30px 30px; text-align: center;">
                        <h2 style="color: #1f2937; font-size: 24px; font-weight: 600; margin: 0 0 20px;">
                            Hi ${name || 'there'} 👋
                        </h2>
                        <p style="color: #4b5563; font-size: 17px; line-height: 1.6; margin: 0 0 30px;">
                            Thank you for subscribing to <strong>The Economist Newsletter</strong>! 
                            We're thrilled to have you join our community of economic enthusiasts.
                        </p>
                    </div>

                    <!-- What you'll receive section -->
                    <div style="padding: 0 30px 30px;">
                        <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-radius: 12px; padding: 30px; margin-bottom: 30px; border-left: 5px solid #f59e0b;">
                            <h3 style="color: #92400e; font-size: 20px; font-weight: 600; margin: 0 0 20px; display: flex; align-items: center;">
                                <span style="margin-right: 10px;">📦</span>
                                What's Inside Your Newsletter
                            </h3>
                            <div style="display: grid; gap: 15px;">
                                <div style="display: flex; align-items: center; background-color: rgba(255, 255, 255, 0.6); padding: 15px; border-radius: 8px;">
                                    <span style="font-size: 24px; margin-right: 15px;">📊</span>
                                    <div>
                                        <strong style="color: #92400e; font-size: 16px;">Weekly Economic Analysis</strong>
                                        <p style="color: #78350f; margin: 5px 0 0; font-size: 14px;">In-depth insights on market trends and economic indicators</p>
                                    </div>
                                </div>
                                <div style="display: flex; align-items: center; background-color: rgba(255, 255, 255, 0.6); padding: 15px; border-radius: 8px;">
                                    <span style="font-size: 24px; margin-right: 15px;">📈</span>
                                    <div>
                                        <strong style="color: #92400e; font-size: 16px;">Market Trends & Insights</strong>
                                        <p style="color: #78350f; margin: 5px 0 0; font-size: 14px;">Real-time analysis of global financial markets</p>
                                    </div>
                                </div>
                                <div style="display: flex; align-items: center; background-color: rgba(255, 255, 255, 0.6); padding: 15px; border-radius: 8px;">
                                    <span style="font-size: 24px; margin-right: 15px;">🌍</span>
                                    <div>
                                        <strong style="color: #92400e; font-size: 16px;">Global Economic News</strong>
                                        <p style="color: #78350f; margin: 5px 0 0; font-size: 14px;">Curated news from leading financial publications</p>
                                    </div>
                                </div>
                                <div style="display: flex; align-items: center; background-color: rgba(255, 255, 255, 0.6); padding: 15px; border-radius: 8px;">
                                    <span style="font-size: 24px; margin-right: 15px;">🤖</span>
                                    <div>
                                        <strong style="color: #92400e; font-size: 16px;">AI-Powered Summaries</strong>
                                        <p style="color: #78350f; margin: 5px 0 0; font-size: 14px;">Concise, intelligent analysis of complex economic data</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Schedule info -->
                        <div style="background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%); border-radius: 12px; padding: 25px; text-align: center; border-left: 5px solid #3b82f6;">
                            <h3 style="color: #1e40af; font-size: 18px; font-weight: 600; margin: 0 0 15px;">
                                📅 Delivery Schedule
                            </h3>
                            <p style="color: #1e3a8a; margin: 0; font-size: 15px; line-height: 1.5;">
                                <strong>Mondays:</strong> Week Ahead Preview<br>
                                <strong>Fridays:</strong> Weekly Economic Wrap-up
                            </p>
                        </div>

                        <!-- CTA -->
                        <div style="text-align: center; margin: 40px 0 30px;">
                            <p style="color: #6b7280; margin: 0 0 20px; font-size: 16px;">
                                Your first newsletter will arrive soon!
                            </p>
                            <a href="https://the-economist.vercel.app/archive" style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 10px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(59, 130, 246, 0.25);">
                                🚀 Explore Our Archive
                            </a>
                        </div>
                    </div>

                    <!-- Footer -->
                    <div style="background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                        <p style="color: #4b5563; margin: 0 0 15px; font-size: 16px; font-weight: 500;">
                            Best regards,<br>
                            <span style="color: #1f2937; font-weight: 600;">The Economist Newsletter Team</span>
                        </p>
                        <div style="padding-top: 20px; border-top: 1px solid #e5e7eb;">
                            <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                                Questions? Reply to this email or 
                                <a href="https://the-economist.vercel.app/contact-us" style="color: #3b82f6; text-decoration: none;">contact our support team</a>
                            </p>
                        </div>
                    </div>
                </div>
            </body>
            </html>
        `;
    }

    static formatText(name?: string): string {
        return `
            Welcome to The Economist Newsletter!
            
            Hi ${name || 'there'},
            
            Thank you for subscribing to our economic insights newsletter. You'll receive:
            
            • Weekly economic analysis
            • Market trends and insights  
            • Global economic news
            • AI-powered summaries
            
            Your first newsletter will arrive soon!
            
            Best regards,
            The Economist Newsletter Team
        `;
    }
}
