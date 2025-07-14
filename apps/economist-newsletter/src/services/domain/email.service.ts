import { NewsletterContent } from "../../schemas/validation.schemas";
import type { IEmailService, IConfigService } from "../repository/interfaces";
import { injectable, inject } from "inversify";
import { Resend } from 'resend';
import { TYPES } from "../config/types";
import { NewsletterTemplate } from "../../templates/newsletter.template";
import { WelcomeTemplate } from "../../templates/welcome.template";
import { UnsubscribeTemplate } from "../../templates/unsubscribe.template";
import { DailyNewsletterTemplate } from "../../templates/daily-newsletter.template";
import { DailyNewsContent } from "../../schemas/validation.schemas";

@injectable()
export class EmailService implements IEmailService {
    private resend: Resend;
    private subscribers: Map<string, { firstName?: string; lastName?: string; listIds?: number[]; email: string }> = new Map();

    constructor(
        @inject(TYPES.ConfigService) private configService: IConfigService
    ) {
        // Initialize Resend with API key
        this.resend = new Resend(this.configService.getResendApiKey());
    }

    async subscribeToNewsletter(email: string, firstName?: string, lastName?: string, listIds?: number[]): Promise<{ success: boolean; message: string; }> {
        try {
            // TODO: Store in a database
            this.subscribers.set(email, { firstName, lastName, listIds, email });
            
            return { 
                success: true, 
                message: `Subscriber ${email} added successfully` 
            };
        } catch (err: any) {
            throw new Error(err.message || 'Failed to subscribe user');
        }
    }

    async sendNewsletter(content: NewsletterContent, recipients: string[]): Promise<{ sent: number; failed: number; }> {
        let sent = 0;
        let failed = 0;

        // Send in batches to avoid rate limits (Resend has rate limits too)
        const batchSize = 100; // Resend allows up to 100 recipients per batch
        for (let i = 0; i < recipients.length; i += batchSize) {
            const batch = recipients.slice(i, i + batchSize);
            
            try {
                const emailData = {
                    from: `${this.configService.getDefaultFromName()} <${this.configService.getDefaultFromEmail()}>`,
                    to: batch,
                    subject: content.title,
                    html: NewsletterTemplate.formatHTML(content),
                    text: NewsletterTemplate.formatText(content)
                };

                await this.resend.emails.send(emailData);
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
                from: `${this.configService.getDefaultFromName()} <${this.configService.getDefaultFromEmail()}>`,
                to: [email],
                subject: 'Welcome to The Economist Newsletter!',
                html: WelcomeTemplate.formatHTML(name),
                text: WelcomeTemplate.formatText(name)
            };

            await this.resend.emails.send(emailData);
            return true;
        } catch (error) {
            console.error('Failed to send welcome email:', error);
            return false;
        }
    }

    async sendUnsubscribeConfirmation(email: string): Promise<boolean> {
        try {
            const emailData = {
                from: `${this.configService.getDefaultFromName()} <${this.configService.getDefaultFromEmail()}>`,
                to: [email],
                subject: 'Unsubscribe Confirmation',
                html: UnsubscribeTemplate.formatHTML(),
                text: UnsubscribeTemplate.formatText()
            };

            await this.resend.emails.send(emailData);
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
        const batchSize = 100; // Resend allows up to 100 recipients per batch
        for (let i = 0; i < recipients.length; i += batchSize) {
            const batch = recipients.slice(i, i + batchSize);
            
            try {
                const emailData = {
                    from: `${this.configService.getDefaultFromName()} <${this.configService.getDefaultFromEmail()}>`,
                    to: batch,
                    subject: `Daily Economic Digest - ${content.title}`,
                    html: DailyNewsletterTemplate.formatHTML(content),
                    text: DailyNewsletterTemplate.formatText(content)
                };

                await this.resend.emails.send(emailData);
                sent += batch.length;
            } catch (error) {
                failed += batch.length;
                console.error(`Failed to send daily newsletter to batch:`, error);
            }
        }

        return { sent, failed };
    }

    // Helper methods for subscriber management
    getSubscribers(listIds?: number[]): { email: string; firstName?: string; lastName?: string; listIds?: number[] }[] {
        const allSubscribers = Array.from(this.subscribers.values());
        
        if (!listIds || listIds.length === 0) {
            return allSubscribers;
        }
        
        return allSubscribers.filter(subscriber => 
            subscriber.listIds?.some(id => listIds.includes(id))
        );
    }

    getSubscriberEmails(listIds?: number[]): string[] {
        return this.getSubscribers(listIds).map(subscriber => subscriber.email);
    }

    // Private helper methods
}