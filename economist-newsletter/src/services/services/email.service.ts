import { NewsletterContent } from "../../schemas/validation.schemas";
import type { IEmailService, IConfigService } from "../interfaces/services.interfaces";
import { injectable, inject } from "inversify";
import { TYPES } from "../config/inversify.config";
import Brevo from '@getbrevo/brevo';

@injectable()
export class EmailService implements IEmailService {
    private contactsApi: Brevo.ContactsApi;
    private transactionalEmailsApi: Brevo.TransactionalEmailsApi;

    constructor(
        @inject(TYPES.ConfigService) private configService: IConfigService
    ) {
        // Initialize Brevo APIs with injected config
        this.contactsApi = new Brevo.ContactsApi();
        this.contactsApi.setApiKey(
            Brevo.ContactsApiApiKeys.apiKey, 
            this.configService.get<string>('BREVO_API_KEY')
        );

        this.transactionalEmailsApi = new Brevo.TransactionalEmailsApi();
        this.transactionalEmailsApi.setApiKey(
            Brevo.TransactionalEmailsApiApiKeys.apiKey,
            this.configService.getBrevoApiKey()
        );
    }

    async subscribeToNewsletter(email: string, firstName?: string, lastName?: string, listIds?: number[]): Promise<{ success: boolean; message: string; }> {
        const payload: any = {
            email,
            updateEnabled: true,
            attributes: {}
        };
        
        if (firstName) payload.attributes.FNAME = firstName;
        if (lastName) payload.attributes.LNAME = lastName;
        if (listIds) payload.listIds = listIds;

        try {
            const response = await this.contactsApi.createContact(payload);
            return { 
                success: true, 
                message: `Contact ${response} added/updated successfully` 
            };
        } catch (err: any) {
            const msg = err.response?.body?.message ?? err.message;
            throw new Error(msg);
        }
    }

    async sendNewsletter(content: NewsletterContent, recipients: string[]): Promise<{ sent: number; failed: number; }> {
        let sent = 0;
        let failed = 0;

        // Send in batches to avoid rate limits
        const batchSize = 50;
        for (let i = 0; i < recipients.length; i += batchSize) {
            const batch = recipients.slice(i, i + batchSize);
            
            try {
                const emailData = {
                    sender: {
                        email: this.configService.getDefaultFromEmail(),
                        name: this.configService.getDefaultFromName()
                    },
                    to: batch.map(email => ({ email })),
                    subject: content.title,
                    htmlContent: this.formatNewsletterHTML(content),
                    textContent: this.formatNewsletterText(content)
                };

                await this.transactionalEmailsApi.sendTransacEmail(emailData);
                sent += batch.length;
            } catch (error) {
                failed += batch.length;
                console.error(`Failed to send newsletter to batch:`, error);
            }
        }

        return { sent, failed };
    }

    async sendWelcomeEmail(email: string, name?: string): Promise<boolean> {
        try {
            const emailData = {
                sender: {
                    email: this.configService.getDefaultFromEmail(),
                    name: this.configService.getDefaultFromName()
                },
                to: [{ email, name }],
                subject: 'Welcome to The Economist Newsletter!',
                htmlContent: this.generateWelcomeHTML(name),
                textContent: this.generateWelcomeText(name)
            };

            await this.transactionalEmailsApi.sendTransacEmail(emailData);
            return true;
        } catch (error) {
            console.error('Failed to send welcome email:', error);
            return false;
        }
    }

    async sendUnsubscribeConfirmation(email: string): Promise<boolean> {
        try {
            const emailData = {
                sender: {
                    email: this.configService.getDefaultFromEmail(),
                    name: this.configService.getDefaultFromName()
                },
                to: [{ email }],
                subject: 'Unsubscribe Confirmation',
                htmlContent: this.generateUnsubscribeHTML(),
                textContent: 'You have been successfully unsubscribed from our newsletter.'
            };

            await this.transactionalEmailsApi.sendTransacEmail(emailData);
            return true;
        } catch (error) {
            console.error('Failed to send unsubscribe confirmation:', error);
            return false;
        }
    }

    async generateUnsubscribeLink(email: string): Promise<string> {
        // Generate JWT token for secure unsubscribe
        const token = Buffer.from(JSON.stringify({ email, timestamp: Date.now() })).toString('base64');
        const baseUrl = this.configService.isDevelopment() 
            ? 'http://localhost:3000' 
            : 'https://the-economist.vercel.app';
        
        return `${baseUrl}/unsubscribe?token=${token}`;
    }

    // Private helper methods
    private formatNewsletterHTML(content: NewsletterContent): string {
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

    private formatNewsletterText(content: NewsletterContent): string {
        return `
            ${content.title}
            
            ${content.content.replace(/<[^>]*>/g, '')}
            
            ${content.summary ? `Summary: ${content.summary}` : ''}
            
            --
            You're receiving this because you subscribed to The Economist Newsletter.
            Unsubscribe: {{unsubscribe_link}}
        `;
    }

    private generateWelcomeHTML(name?: string): string {
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

    private generateWelcomeText(name?: string): string {
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

    private generateUnsubscribeHTML(): string {
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
}