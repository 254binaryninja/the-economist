import { injectable, inject } from "inversify";
import type { IStorageService } from "../../repository/interfaces";
import { TYPES } from "../../config/types";
import { WelcomeTemplate } from "../../../templates/welcome.template";
import { UnsubscribeTemplate } from "../../../templates/unsubscribe.template";
import { EmailProviderService, EmailData } from "./email-provider.service";

@injectable()
export class SubscriptionEmailService {
    constructor(
        @inject(TYPES.EmailProviderService) private emailProvider: EmailProviderService,
        @inject(TYPES.StorageService) private storageService: IStorageService
    ) {}

    async subscribeToNewsletter(email: string, firstName?: string, lastName?: string, listIds?: number[]): Promise<{ success: boolean; message: string; }> {
        try {
            // Store subscriber in database using storage service
            const result = await this.storageService.savePublicNewsletterSignup(email);
            
            // Send welcome email
            await this.sendWelcomeEmail(email, firstName);
            
            return { 
                success: true, 
                message: `Subscriber ${email} added successfully with ID: ${result.id}` 
            };
        } catch (err: any) {
            throw new Error(err.message || 'Failed to subscribe user');
        }
    }

    async unsubscribeFromNewsletter(email: string): Promise<{ success: boolean; message: string }> {
        try {
            // Update subscription status in storage
            const success = await this.storageService.unsubscribeFromNewsletter(email);
            
            if (success) {
                // Send unsubscribe confirmation email
                await this.sendUnsubscribeConfirmation(email);
                
                return {
                    success: true,
                    message: `Successfully unsubscribed ${email}`
                };
            } else {
                return {
                    success: false,
                    message: `Failed to unsubscribe ${email} - email may not be found`
                };
            }
        } catch (error) {
            console.error('Failed to unsubscribe:', error);
            return {
                success: false,
                message: `Failed to unsubscribe ${email}`
            };
        }
    }

    async sendWelcomeEmail(email: string, name?: string): Promise<boolean> {
        try {
            const emailData: EmailData = {
                from: this.emailProvider.getFromAddress(),
                to: email,
                subject: 'Welcome to The Economist Newsletter!',
                html: WelcomeTemplate.formatHTML(name),
                text: WelcomeTemplate.formatText(name)
            };

            const result = await this.emailProvider.sendEmail(emailData);
            return result.success;
        } catch (error) {
            console.error('Failed to send welcome email:', error);
            return false;
        }
    }

    async sendUnsubscribeConfirmation(email: string): Promise<boolean> {
        try {
            const emailData: EmailData = {
                from: this.emailProvider.getFromAddress(),
                to: email,
                subject: 'Unsubscribe Confirmation',
                html: UnsubscribeTemplate.formatHTML(),
                text: UnsubscribeTemplate.formatText()
            };

            const result = await this.emailProvider.sendEmail(emailData);
            return result.success;
        } catch (error) {
            console.error('Failed to send unsubscribe confirmation:', error);
            return false;
        }
    }
}
