import { injectable, inject } from "inversify";
import type { IStorageService } from "../../repository/interfaces";
import { TYPES } from "../../config/types";
import { NewsletterContent, DailyNewsContent } from "../../../schemas/validation.schemas";
import { NewsletterTemplate } from "../../../templates/newsletter.template";
import { DailyNewsletterTemplate } from "../../../templates/daily-newsletter.template";
import { EmailProviderService, EmailData } from "./email-provider.service";

@injectable()
export class NewsletterEmailService {
    constructor(
        @inject(TYPES.EmailProviderService) private emailProvider: EmailProviderService,
        @inject(TYPES.StorageService) private storageService: IStorageService
    ) {}

    async sendNewsletter(content: NewsletterContent, recipients?: string[]): Promise<{ sent: number; failed: number; }> {
        let sent = 0;
        let failed = 0;

        // Get recipients from storage service if not provided
        const emailRecipients = recipients || await this.getConfirmedSubscriberEmails();

        // Send in batches to avoid rate limits
        const batchSize = this.emailProvider.getBatchSize();
        for (let i = 0; i < emailRecipients.length; i += batchSize) {
            const batch = emailRecipients.slice(i, i + batchSize);
            
            try {
                const emailData: EmailData = {
                    from: this.emailProvider.getFromAddress(),
                    to: batch,
                    subject: content.title,
                    html: NewsletterTemplate.formatHTML(content),
                    text: NewsletterTemplate.formatText(content)
                };

                const result = await this.emailProvider.sendEmail(emailData);
                
                if (result.success) {
                    sent += batch.length;
                    
                    // Track email delivery for each recipient in the batch
                    if (result.messageId) {
                        for (const email of batch) {
                            await this.storageService.recordEmailDelivery({
                                email,
                                trackingId: result.messageId,
                                content: content.title
                            });
                        }
                    }
                } else {
                    failed += batch.length;
                    console.error(`Failed to send newsletter to batch:`, result.error);
                }
            } catch (error) {
                failed += batch.length;
                console.error(`Failed to send newsletter to batch:`, error);
            }
        }

        return { sent, failed };
    }

    async sendDailyNewsletter(content: DailyNewsContent, recipients?: string[]): Promise<{ sent: number; failed: number; }> {
        let sent = 0;
        let failed = 0;

        // Get recipients from storage service if not provided
        const emailRecipients = recipients || await this.getConfirmedSubscriberEmails();

        // Send in batches to avoid rate limits
        const batchSize = this.emailProvider.getBatchSize();
        for (let i = 0; i < emailRecipients.length; i += batchSize) {
            const batch = emailRecipients.slice(i, i + batchSize);
            
            try {
                const emailData: EmailData = {
                    from: this.emailProvider.getFromAddress(),
                    to: batch,
                    subject: `Daily Economic Digest - ${content.title}`,
                    html: DailyNewsletterTemplate.formatHTML(content),
                    text: DailyNewsletterTemplate.formatText(content)
                };

                const result = await this.emailProvider.sendEmail(emailData);
                
                if (result.success) {
                    sent += batch.length;
                    
                    // Track email delivery for each recipient in the batch
                    if (result.messageId) {
                        for (const email of batch) {
                            await this.storageService.recordEmailDelivery({
                                email,
                                trackingId: result.messageId,
                                content: `Daily Economic Digest - ${content.title}`
                            });
                        }
                    }
                } else {
                    failed += batch.length;
                    console.error(`Failed to send daily newsletter to batch:`, result.error);
                }
            } catch (error) {
                failed += batch.length;
                console.error(`Failed to send daily newsletter to batch:`, error);
            }
        }

        return { sent, failed };
    }

    private async getConfirmedSubscriberEmails(): Promise<string[]> {
        try {
            const confirmedSubscribers = await this.storageService.getConfirmedSubscribers();
            return confirmedSubscribers.map(subscriber => subscriber.email);
        } catch (error) {
            console.error('Failed to get confirmed subscriber emails:', error);
            return [];
        }
    }
}
