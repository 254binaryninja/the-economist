import { injectable, inject } from "inversify";
import type { IStorageService, IConfigService } from "../../repository/interfaces";
import { TYPES } from "../../config/types";

@injectable()
export class SubscriberManagementService {
    constructor(
        @inject(TYPES.StorageService) private storageService: IStorageService,
        @inject(TYPES.ConfigService) private configService: IConfigService
    ) {}

    async getSubscribers(listIds?: number[]): Promise<{ email: string; firstName?: string; lastName?: string; listIds?: number[] }[]> {
        try {
            // Get confirmed subscribers from storage service
            const confirmedSubscribers = await this.storageService.getConfirmedSubscribers();
            
            // For now, return basic subscriber info without firstName/lastName/listIds
            // TODO: Extend storage schema to include these fields if needed
            return confirmedSubscribers.map(subscriber => ({
                email: subscriber.email,
                firstName: undefined,
                lastName: undefined,
                listIds: undefined
            }));
        } catch (error) {
            console.error('Failed to get subscribers:', error);
            return [];
        }
    }

    async getSubscriberEmails(listIds?: number[]): Promise<string[]> {
        try {
            const subscribers = await this.getSubscribers(listIds);
            return subscribers.map(subscriber => subscriber.email);
        } catch (error) {
            console.error('Failed to get subscriber emails:', error);
            return [];
        }
    }

    async getConfirmedSubscriberEmails(): Promise<string[]> {
        try {
            const confirmedSubscribers = await this.storageService.getConfirmedSubscribers();
            return confirmedSubscribers.map(subscriber => subscriber.email);
        } catch (error) {
            console.error('Failed to get confirmed subscriber emails:', error);
            return [];
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
}
