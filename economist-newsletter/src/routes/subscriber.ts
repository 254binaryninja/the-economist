import { FastifyPluginAsync, FastifyRequest, FastifyReply } from 'fastify';
import { container, TYPES } from '../services/config/inversify.config';
import { IEmailService } from '../services/interfaces/services.interfaces';
import { subscribeSchema, SubscribeInput, UnsubscribeInput } from '../schemas/validation.schemas';

const subscriberRoute: FastifyPluginAsync = async (fastify) => {
  
  fastify.post('/subscribe', {
    schema: {
      body: subscribeSchema,
      response: {
        200: { 
          type: 'object', 
          properties: { 
            success: { type: 'boolean' }, 
            message: { type: 'string' } 
          } 
        },
        400: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            error: { type: 'string' }
          }
        }
      }
    }
  }, async (request: FastifyRequest<{ Body: SubscribeInput }>, reply: FastifyReply) => {
    
    try {
      // Get the email service from the container
      const emailService = container.get<IEmailService>(TYPES.EmailService);
      
      const { email, firstName, lastName, listIds } = request.body;

      // Subscribe user to newsletter
      const result = await emailService.subscribeToNewsletter(email, firstName, lastName, listIds);
      
      if (result.success) {
        // Send welcome email
        await emailService.sendWelcomeEmail(email, firstName);
        
        fastify.log.info(`New subscriber: ${email}`);
        return result;
      } else {
        reply.status(400);
        return {
          success: false,
          message: result.message,
          error: 'SUBSCRIPTION_FAILED'
        };
      }
      
    } catch (err: any) {
      fastify.log.error('Subscription error:', err);
      
      reply.status(400);
      return { 
        success: false, 
        message: err.message || 'Subscription failed',
        error: 'SUBSCRIPTION_ERROR'
      };
    }
  });

  // Unsubscribe endpoint
  fastify.post('/unsubscribe', async (request: FastifyRequest<{Body:UnsubscribeInput}>, reply: FastifyReply) => {
    try {
      const { email, token } = request.body;
      const emailService = container.get<IEmailService>(TYPES.EmailService);
      
      // Validate token
      if (!token || !email) {
        reply.status(400);
        return {
          success: false,
          message: 'Invalid request',
          error: 'INVALID_REQUEST'
      }; // TODO: Implement token validation at middleware level using clerk
      }
      await emailService.sendUnsubscribeConfirmation(email);

      return { success: true, message: 'Unsubscribed successfully' };
    } catch (err: any) {
      fastify.log.error('Unsubscribe error:', err);
      reply.status(400);
      return { success: false, message: err.message };
    }
  });
};

export default subscriberRoute;
