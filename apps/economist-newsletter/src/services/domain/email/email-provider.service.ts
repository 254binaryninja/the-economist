import { injectable, inject } from "inversify";
import * as nodemailer from 'nodemailer';
import { Resend } from 'resend';
import type { IConfigService } from "../../repository/interfaces";
import { TYPES } from "../../config/types";

export interface EmailProviderResult {
    success: boolean;
    messageId?: string;
    error?: string;
}

export interface EmailData {
    from: string;
    to: string | string[];
    subject: string;
    html: string;
    text: string;
}

@injectable()
export class EmailProviderService {
    private resend?: Resend;
    private transporter?: nodemailer.Transporter;
    private isDevMode: boolean;

    constructor(
        @inject(TYPES.ConfigService) private configService: IConfigService
    ) {
        this.isDevMode = this.configService.isDevelopment();
        
        if (this.isDevMode) {
            this.initializeNodemailer();
        } else {
            this.resend = new Resend(this.configService.getResendApiKey());
        }
    }

    private initializeNodemailer() {
        // Gmail configuration for development
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.GMAIL_USER || 'your-email@gmail.com',
                pass: process.env.GMAIL_APP_PASSWORD || 'your-app-password'
            }
        });
    }

    async sendEmail(emailData: EmailData): Promise<EmailProviderResult> {
        try {
            if (this.isDevMode && this.transporter) {
                // Use Nodemailer for development
                const result = await this.transporter.sendMail({
                    from: emailData.from,
                    to: Array.isArray(emailData.to) ? emailData.to.join(', ') : emailData.to,
                    subject: emailData.subject,
                    html: emailData.html,
                    text: emailData.text
                });
                
                return {
                    success: true,
                    messageId: result.messageId
                };
            } else if (!this.isDevMode && this.resend) {
                // Use Resend for production
                const result = await this.resend.emails.send({
                    from: emailData.from,
                    to: Array.isArray(emailData.to) ? emailData.to : [emailData.to],
                    subject: emailData.subject,
                    html: emailData.html,
                    text: emailData.text
                });
                
                return {
                    success: true,
                    messageId: result.data?.id
                };
            } else {
                throw new Error(`Email provider not properly initialized for ${this.isDevMode ? 'development' : 'production'} mode`);
            }
        } catch (error) {
            console.error('Email sending failed:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }

    getFromAddress(): string {
        if (this.isDevMode) {
            // Use Gmail account for development
            return process.env.GMAIL_USER || 'your-email@gmail.com';
        } else {
            // Use configured email for production
            return `${this.configService.getDefaultFromName()} <${this.configService.getDefaultFromEmail()}>`;
        }
    }

    getBatchSize(): number {
        return this.isDevMode ? 10 : 100; // Smaller batches for Gmail in dev mode
    }

    isInDevMode(): boolean {
        return this.isDevMode;
    }
}
