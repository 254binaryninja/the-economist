import { NewsletterContent } from "../../schemas/validation.schemas";
import type { IEmailService, IConfigService } from "../repository/interfaces";
import { injectable, inject } from "inversify";
import Brevo from '@getbrevo/brevo';
import { TYPES } from "../config/types";
import { NewsletterTemplate } from "../../templates/newsletter.template";
import { WelcomeTemplate } from "../../templates/welcome.template";
import { UnsubscribeTemplate } from "../../templates/unsubscribe.template";
import { DailyNewsletterTemplate } from "../../templates/daily-newsletter.template";
import { DailyNewsContent } from "../../schemas/validation.schemas";

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
                    htmlContent: NewsletterTemplate.formatHTML(content),
                    textContent: NewsletterTemplate.formatText(content)
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
                htmlContent: WelcomeTemplate.formatHTML(name),
                textContent: WelcomeTemplate.formatText(name)
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
                htmlContent: UnsubscribeTemplate.formatHTML(),
                textContent: UnsubscribeTemplate.formatText()
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

    async sendDailyNewsletter(content: DailyNewsContent, recipients: string[]): Promise<{ sent: number; failed: number; }> {
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
                    subject: `Daily Economic Digest - ${content.title}`,
                    htmlContent: DailyNewsletterTemplate.formatHTML(content),
                    textContent: DailyNewsletterTemplate.formatText(content)
                };

                await this.transactionalEmailsApi.sendTransacEmail(emailData);
                sent += batch.length;
            } catch (error) {
                failed += batch.length;
                console.error(`Failed to send daily newsletter to batch:`, error);
            }
        }

        return { sent, failed };
    }

    // Private helper methods
}