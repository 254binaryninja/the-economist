import { injectable, inject } from "inversify";
import type { IEmailService } from "../../repository/interfaces";
import { TYPES } from "../../config/types";
import { NewsletterContent, DailyNewsContent } from "../../../schemas/validation.schemas";
import { NewsletterEmailService } from "./newsletter-email.service";
import { SubscriptionEmailService } from "./subscription-email.service";
import { SubscriberManagementService } from "./subscriber-management.service";

@injectable()
export class EmailService implements IEmailService {
    constructor(
        @inject(TYPES.NewsletterEmailService) private newsletterEmail: NewsletterEmailService,
        @inject(TYPES.SubscriptionEmailService) private subscriptionEmail: SubscriptionEmailService,
        @inject(TYPES.SubscriberManagementService) private subscriberManagement: SubscriberManagementService
    ) {}

    // Newsletter-related methods - delegated to NewsletterEmailService
    async sendNewsletter(content: NewsletterContent, recipients?: string[]): Promise<{ sent: number; failed: number; }> {
        return this.newsletterEmail.sendNewsletter(content, recipients);
    }

    async sendDailyNewsletter(content: DailyNewsContent, recipients?: string[]): Promise<{ sent: number; failed: number; }> {
        return this.newsletterEmail.sendDailyNewsletter(content, recipients);
    }

    // Subscription-related methods - delegated to SubscriptionEmailService
    async subscribeToNewsletter(email: string, firstName?: string, lastName?: string, listIds?: number[]): Promise<{ success: boolean; message: string; }> {
        return this.subscriptionEmail.subscribeToNewsletter(email, firstName, lastName, listIds);
    }

    async unsubscribeFromNewsletter(email: string): Promise<{ success: boolean; message: string }> {
        return this.subscriptionEmail.unsubscribeFromNewsletter(email);
    }

    async sendWelcomeEmail(email: string, name?: string): Promise<boolean> {
        return this.subscriptionEmail.sendWelcomeEmail(email, name);
    }

    async sendUnsubscribeConfirmation(email: string): Promise<boolean> {
        return this.subscriptionEmail.sendUnsubscribeConfirmation(email);
    }

    // Subscriber management methods - delegated to SubscriberManagementService
    async generateUnsubscribeLink(email: string): Promise<string> {
        return this.subscriberManagement.generateUnsubscribeLink(email);
    }

    // Helper methods for backward compatibility
    async getSubscribers(listIds?: number[]): Promise<{ email: string; firstName?: string; lastName?: string; listIds?: number[] }[]> {
        return this.subscriberManagement.getSubscribers(listIds);
    }

    async getSubscriberEmails(listIds?: number[]): Promise<string[]> {
        return this.subscriberManagement.getSubscriberEmails(listIds);
    }
}
