import { FastifyPluginAsync, FastifyRequest, FastifyReply } from 'fastify';
import { container } from '../../../../services/config/inversify.config';
import { TYPES } from '../../../../services/config/types';
import { IEmailService } from '../../../../services/repository/interfaces';
import { subscribeSchema, SubscribeInput, UnsubscribeInput } from '../../../../schemas/validation.schemas';

// Fastify JSON Schema for subscribe endpoint
const subscribeJSONSchema = {
  type: 'object',
  required: ['email'],
  properties: {
    email: {
      type: 'string',
      format: 'email',
      maxLength: 255
    },
    firstName: {
      type: 'string',
      minLength: 1,
      maxLength: 50,
      pattern: '^[a-zA-Z\\s\'-]+$'
    },
    lastName: {
      type: 'string',
      minLength: 1,
      maxLength: 50,
      pattern: '^[a-zA-Z\\s\'-]+$'
    },
    listIds: {
      type: 'array',
      items: {
        type: 'number'
      },
      maxItems: 10
    },
    preferences: {
      type: 'object',
      properties: {
        frequency: {
          type: 'string',
          enum: ['weekly', 'bi-weekly', 'monthly'],
          default: 'weekly'
        },
        topics: {
          type: 'array',
          items: {
            type: 'string',
            enum: ['markets', 'policy', 'global', 'tech', 'crypto']
          },
          maxItems: 5
        }
      }
    }
  }
};

// Fastify JSON Schema for unsubscribe endpoint
const unsubscribeJSONSchema = {
  type: 'object',
  required: ['email'],
  properties: {
    email: {
      type: 'string',
      format: 'email'
    },
    token: {
      type: 'string',
      format: 'uuid'
    }
  }
};

const subscriberRoute: FastifyPluginAsync = async (fastify) => {
  
  fastify.post('/subscribe', {
    schema: {
      body: subscribeJSONSchema,
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
      // Validate request body with Zod for additional validation
      const validatedData = subscribeSchema.parse(request.body);
      
      // Get the email service from the container
      const emailService = container.get<IEmailService>(TYPES.EmailService);
      
      const { email, firstName, lastName, listIds } = validatedData;

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
  fastify.post('/unsubscribe', {
    schema: {
      body: unsubscribeJSONSchema,
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
  }, async (request: FastifyRequest<{Body:UnsubscribeInput}>, reply: FastifyReply) => {
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
