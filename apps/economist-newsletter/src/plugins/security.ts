import fp from 'fastify-plugin';
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';

export default fp(async (fastify: FastifyInstance) => {
  
  // Security headers
  fastify.addHook('onSend', async (request: FastifyRequest, reply: FastifyReply, payload) => {
    // Prevent MIME type sniffing
    reply.header('X-Content-Type-Options', 'nosniff');
    
    // Prevent clickjacking
    reply.header('X-Frame-Options', 'DENY');
    
    // XSS protection
    reply.header('X-XSS-Protection', '1; mode=block');
    
    // Referrer policy
    reply.header('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    // Content Security Policy for API
    reply.header('Content-Security-Policy', "default-src 'none'; frame-ancestors 'none';");
    
    // Remove sensitive headers
    reply.removeHeader('X-Powered-By');
    reply.removeHeader('Server');
    
    return payload;
  });

  // Input sanitization hook
  fastify.addHook('preHandler', async (request: FastifyRequest, reply: FastifyReply) => {
    // Sanitize request body
    if (request.body && typeof request.body === 'object') {
      request.body = sanitizeObject(request.body);
    }

    // Sanitize query parameters
    if (request.query && typeof request.query === 'object') {
      request.query = sanitizeObject(request.query);
    }

    // Log suspicious requests
    const suspiciousPatterns = [
      /<script[^>]*>.*?<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /\beval\b/gi,
      /\bdocument\./gi,
      /\bwindow\./gi
    ];

    const requestString = JSON.stringify({ body: request.body, query: request.query });
    
    for (const pattern of suspiciousPatterns) {
      if (pattern.test(requestString)) {
        fastify.log.warn(`Suspicious request detected from IP: ${request.ip}`, {
          ip: request.ip,
          userAgent: request.headers['user-agent'],
          path: request.url,
          pattern: pattern.source
        });
        
        reply.status(400);
        return reply.send({
          success: false,
          message: 'Invalid request format',
          error: 'INVALID_INPUT'
        });
      }
    }
  });

  // CORS configuration
  await fastify.register(import('@fastify/cors'), {
    origin: (origin, callback) => {
      const allowedOrigins = [
        'http://localhost:3000',
        'http://localhost:3001',
        'https://the-economist.vercel.app'
      ];

      // Allow requests with no origin (mobile apps, etc.)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      fastify.log.warn(`CORS blocked origin: ${origin}`);
      return callback(new Error('Not allowed by CORS'), false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  });

  // Request size limits
  fastify.addContentTypeParser('application/json', { parseAs: 'string', bodyLimit: 1024 * 100 }, // 100KB limit
    (req, body, done) => {
      try {
        const json = JSON.parse(body as string);
        done(null, json);
      } catch (err: any) {
        err.statusCode = 400;
        done(err, undefined);
      }
    }
  );
});

// Utility function to sanitize objects
function sanitizeObject(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  
  if (typeof obj === 'string') {
    return sanitizeString(obj);
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item));
  }
  
  if (typeof obj === 'object') {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      const sanitizedKey = sanitizeString(key);
      sanitized[sanitizedKey] = sanitizeObject(value);
    }
    return sanitized;
  }
  
  return obj;
}

function sanitizeString(str: string): string {
  if (typeof str !== 'string') return str;
  
  return str
    .replace(/<script[^>]*>.*?<\/script>/gi, '') // Remove script tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .replace(/\beval\b/gi, '') // Remove eval
    .trim();
}
