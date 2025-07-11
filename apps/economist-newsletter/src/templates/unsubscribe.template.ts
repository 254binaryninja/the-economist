export class UnsubscribeTemplate {
    static formatHTML(): string {
        return `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Unsubscribe Confirmation</title>
            </head>
            <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; background-color: #f8fafc;">
                <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                    
                    <!-- Header with subtle gradient -->
                    <div style="background: linear-gradient(135deg, #64748b 0%, #475569 100%); padding: 40px 30px; text-align: center;">
                        <div style="background-color: rgba(255, 255, 255, 0.1); border-radius: 50%; width: 80px; height: 80px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
                            <span style="font-size: 40px; color: #ffffff;">✅</span>
                        </div>
                        <h1 style="color: #ffffff; font-size: 28px; font-weight: 700; margin: 0; text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
                            Unsubscribe Confirmed
                        </h1>
                    </div>

                    <!-- Main content -->
                    <div style="padding: 50px 30px 40px; text-align: center;">
                        <div style="background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%); border-radius: 12px; padding: 30px; margin-bottom: 30px; border-left: 5px solid #ef4444;">
                            <h2 style="color: #dc2626; font-size: 22px; font-weight: 600; margin: 0 0 15px;">
                                You've Been Successfully Unsubscribed
                            </h2>
                            <p style="color: #7f1d1d; margin: 0; font-size: 16px; line-height: 1.6;">
                                You will no longer receive newsletters from The Economist Newsletter.
                            </p>
                        </div>

                        <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border-radius: 12px; padding: 30px; margin-bottom: 30px; border-left: 5px solid #0ea5e9;">
                            <h3 style="color: #0c4a6e; font-size: 20px; font-weight: 600; margin: 0 0 15px;">
                                😢 We're Sorry to See You Go!
                            </h3>
                            <p style="color: #0c4a6e; margin: 0 0 20px; font-size: 15px; line-height: 1.6;">
                                Your insights and engagement meant a lot to us. If you have any feedback 
                                about how we can improve, we'd love to hear from you.
                            </p>
                            <a href="mailto:feedback@yourdomain.com" style="display: inline-block; background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%); color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; font-size: 14px;">
                                💬 Share Feedback
                            </a>
                        </div>

                        <!-- Re-subscribe option -->
                        <div style="background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border-radius: 12px; padding: 25px; border-left: 5px solid #22c55e;">
                            <h3 style="color: #15803d; font-size: 18px; font-weight: 600; margin: 0 0 15px;">
                                Changed Your Mind?
                            </h3>
                            <p style="color: #166534; margin: 0 0 20px; font-size: 15px;">
                                You can always subscribe again if you want to stay updated with economic insights.
                            </p>
                            <a href="#" style="display: inline-block; background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; font-size: 14px;">
                                🔄 Re-subscribe
                            </a>
                        </div>
                    </div>

                    <!-- Footer -->
                    <div style="background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                        <p style="color: #4b5563; margin: 0 0 15px; font-size: 16px;">
                            Thank you for being part of our community.
                        </p>
                        <p style="color: #6b7280; margin: 0; font-weight: 500;">
                            Best wishes,<br>
                            <span style="color: #1f2937; font-weight: 600;">The Economist Newsletter Team</span>
                        </p>
                        
                        <div style="margin-top: 25px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                            <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                                <a href="#" style="color: #6b7280; text-decoration: none;">Privacy Policy</a>
                                <span style="margin: 0 10px; color: #d1d5db;">|</span>
                                <a href="#" style="color: #6b7280; text-decoration: none;">Contact Us</a>
                            </p>
                        </div>
                    </div>
                </div>
            </body>
            </html>
        `;
    }

    static formatText(): string {
        return 'You have been successfully unsubscribed from our newsletter.';
    }
}
