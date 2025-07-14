import { clerkPlugin, clerkClient } from "@clerk/fastify";
import { FastifyInstance } from "fastify";
import fp from 'fastify-plugin';

export default fp(async (fastify: FastifyInstance) => {
  // Register Clerk plugin
  await fastify.register(clerkPlugin);

  // Add a hook to extract Clerk session token and set it in Supabase
  fastify.addHook('preHandler', async (request, reply) => {
    try {
      // Extract session token from Authorization header
      const authHeader = request.headers.authorization;
      
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const sessionToken = authHeader.substring(7);
        
        try {
          // Verify the session token with Clerk client
          const session = await clerkClient.sessions.verifySession(sessionToken, sessionToken);
          
          if (session && session.userId && fastify.supabase) {
            // Set the token in Supabase service for RLS context
            fastify.supabase.setAuthToken(sessionToken);
            
            // Add user context to request
            request.user = {
              userId: session.userId,
              sessionId: session.id,
              token: sessionToken
            };
          }
        } catch (verifyError) {
          // Session verification failed, continue without auth
          fastify.log.debug('Session verification failed:', verifyError);
        }
      }
    } catch (error) {
      // Silent fail for unauthenticated requests
      fastify.log.debug('No valid Clerk session found:', error);
    }
  });

  // Clean up after request
  fastify.addHook('onResponse', async (request, reply) => {
    if (fastify.supabase) {
      fastify.supabase.clearAuthToken();
    }
  });

  fastify.log.info('Clerk authentication plugin registered successfully');
}, {
  dependencies: ['supabase-plugin'] // Ensure supabase plugin is loaded first
});

declare module 'fastify' {
  export interface FastifyInstance {
    clerk: typeof clerkPlugin;
  }
  
  export interface FastifyRequest {
    user?: {
      userId: string;
      sessionId: string;
      token: string;
    };
  }
}