import { inject, injectable } from "inversify";
import type { ISupabaseService } from "../../repository/interfaces";
import { TYPES } from "../../config/types";

@injectable()
export class NewsletterStorageService {
  constructor(
    @inject(TYPES.SupabaseService) private supabaseService: ISupabaseService
  ) {}

  async savePublicNewsletterSignup(email: string): Promise<{ id: string; confirmationToken: string }> {
    const client = this.supabaseService.getClient();
    const confirmationToken = this.generateConfirmationToken();

    const { data, error } = await client
      .from('public_newsletter_signups')
      .insert({
        email,
      })
      .select('id')
      .single();

    if (error) {
      throw new Error(`Failed to save newsletter signup: ${error.message}`);
    }

    return {
      id: data.id,
      confirmationToken
    };
  }

  async confirmNewsletterSignup(token: string): Promise<boolean> {
    const client = this.supabaseService.getClient();

    const { error } = await client
      .from('public_newsletter_signups')
      .update({
        status: 'confirmed',
        confirmed_at: new Date().toISOString()
      })
      .eq('confirmation_token', token);

    return !error;
  }

  async unsubscribeFromNewsletter(email: string): Promise<boolean> {
    const client = this.supabaseService.getClient();

    const { error } = await client
      .from('public_newsletter_signups')
      .update({ status: 'unsubscribed' })
      .eq('email', email);

    return !error;
  }

  async getConfirmedSubscribers(): Promise<Array<{ id: string; email: string }>> {
    const client = this.supabaseService.getClient();

    const { data, error } = await client
      .from('public_newsletter_signups')
      .select('id, email')
      .eq('status', 'confirmed');

    if (error) {
      throw new Error(`Failed to get confirmed subscribers: ${error.message}`);
    }

    return data;
  }

  async recordEmailDelivery(deliveryData: { email: string; trackingId: string; content?: string }): Promise<string> {
    const client = this.supabaseService.getClient();

    const { data, error } = await client
      .from('email_deliveries')
      .insert({
        email: deliveryData.email,
        tracking_id: deliveryData.trackingId,
        content_reference: deliveryData.content,
        status: 'sent'
      })
      .select('id')
      .single();

    if (error) {
      throw new Error(`Failed to record email delivery: ${error.message}`);
    }

    return data.id;
  }

  async updateEmailDeliveryStatus(trackingId: string, status: 'sent' | 'delivered' | 'failed'): Promise<void> {
    const client = this.supabaseService.getClient();

    const updateData: any = { status };
    if (status === 'delivered') {
      updateData.delivered_at = new Date().toISOString();
    }

    const { error } = await client
      .from('email_deliveries')
      .update(updateData)
      .eq('tracking_id', trackingId);

    if (error) {
      throw new Error(`Failed to update email delivery status: ${error.message}`);
    }
  }

  private generateConfirmationToken(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }
}
