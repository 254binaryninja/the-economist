# Email Service Architecture

This directory contains the refactored email services that have been broken down into smaller, more focused and maintainable components while maintaining dual provider support (Resend/Nodemailer).

## Architecture Overview

The email system follows a modular architecture pattern with the following structure:

```
email/
├── index.ts                          # Exports all email services
├── email.service.ts                  # Main facade service
├── email-provider.service.ts         # Provider abstraction (Resend/Nodemailer)
├── newsletter-email.service.ts       # Newsletter sending operations
├── subscription-email.service.ts     # Subscription management emails
├── subscriber-management.service.ts  # Subscriber data operations
├── email.service.original.ts         # Original service (backup)
└── README.md                         # This file
```

## Service Breakdown

### 1. EmailService (Main Facade)
**File**: `email.service.ts`  
**Purpose**: Acts as a facade that implements the `IEmailService` interface and delegates calls to specialized services.

**Dependencies**:
- `NewsletterEmailService`
- `SubscriptionEmailService` 
- `SubscriberManagementService`

**Why a Facade?**: This pattern ensures backward compatibility with existing consumers while providing the benefits of modular code.

### 2. EmailProviderService
**File**: `email-provider.service.ts`  
**Purpose**: Handles the abstraction between Resend (production) and Nodemailer (development).

**Responsibilities**:
- Environment detection and provider initialization
- Unified email sending interface
- Provider-specific configuration (batch sizes, from addresses)
- Error handling for both providers

**Providers**: 
- **Development**: Nodemailer with Gmail SMTP
- **Production**: Resend API

### 3. NewsletterEmailService
**File**: `newsletter-email.service.ts`  
**Purpose**: Handles all newsletter and digest email operations.

**Responsibilities**:
- Send weekly newsletters to subscribers
- Send daily digest emails
- Batch processing with rate limiting
- Email delivery tracking
- Recipient management (auto-fetch or manual override)

### 4. SubscriptionEmailService
**File**: `subscription-email.service.ts`  
**Purpose**: Manages subscription lifecycle emails.

**Responsibilities**:
- New subscription processing with welcome emails
- Unsubscription workflow with confirmations
- Welcome email sending
- Unsubscribe confirmation emails

### 5. SubscriberManagementService
**File**: `subscriber-management.service.ts`  
**Purpose**: Handles subscriber data retrieval and management.

**Responsibilities**:
- Get subscriber lists with filtering
- Generate secure unsubscribe links
- Subscriber email extraction
- List management operations

## Benefits of This Architecture

### 1. **Single Responsibility Principle**
Each service has a clear, focused responsibility:
- Email Provider → EmailProviderService
- Newsletter Sending → NewsletterEmailService  
- Subscriptions → SubscriptionEmailService
- Subscriber Data → SubscriberManagementService

### 2. **Dual Provider Support**
- **Development**: Gmail with Nodemailer for free testing
- **Production**: Resend for professional delivery
- **Seamless switching**: Based on NODE_ENV

### 3. **Improved Maintainability**
- Smaller, focused files are easier to understand and modify
- Changes to newsletter logic don't affect subscription logic
- Easier to write targeted unit tests

### 4. **Better Debugging**
- Stack traces point to specific, relevant code
- Easier to isolate issues to specific email domains
- Provider-specific error handling

### 5. **Enhanced Testability**
- Each service can be tested in isolation
- Mock dependencies are more focused
- Test files mirror the service structure

### 6. **Backward Compatibility**
- Existing consumers continue to work unchanged
- The `EmailService` facade maintains the original interface
- No breaking changes to the API

## Environment Configuration

### Development (Gmail)
```env
NODE_ENV=development
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-gmail-app-password
```

### Production (Resend)
```env
NODE_ENV=production
RESEND_API_KEY=your-resend-api-key
DEFAULT_FROM_NAME=The Economist Newsletter
DEFAULT_FROM_EMAIL=newsletter@yoursite.com
```

## Usage Examples

### Direct Service Usage
```typescript
// Inject specific services for focused operations
constructor(
  @inject(TYPES.NewsletterEmailService) private newsletterEmail: NewsletterEmailService,
  @inject(TYPES.SubscriptionEmailService) private subscriptionEmail: SubscriptionEmailService
) {}

// Use specific services directly
const result = await this.newsletterEmail.sendNewsletter(content);
const success = await this.subscriptionEmail.subscribeToNewsletter('user@example.com');
```

### Facade Usage (Existing Code)
```typescript
// Existing code continues to work unchanged
constructor(
  @inject(TYPES.EmailService) private emailService: IEmailService
) {}

// Same API as before
const result = await this.emailService.sendNewsletter(content);
const success = await this.emailService.subscribeToNewsletter('user@example.com');
```

### Provider-Specific Operations
```typescript
// Access provider-specific functionality
constructor(
  @inject(TYPES.EmailProviderService) private emailProvider: EmailProviderService
) {}

// Get provider-specific settings
const batchSize = this.emailProvider.getBatchSize(); // 10 for Gmail, 100 for Resend
const fromAddress = this.emailProvider.getFromAddress();
const isDevMode = this.emailProvider.isInDevMode();
```

## Migration Guide

### For New Code
- Use specific email services directly for better type safety and clarity
- Import from the email index: `import { NewsletterEmailService } from '../services/domain/email'`

### For Existing Code
- No changes required - continue using `IEmailService`
- Consider migrating to specific services for better maintainability when making updates

## Dependency Injection Setup

The services are registered in `inversify.config.ts`:

```typescript
// Email services - specialized services
container.bind<EmailProviderService>(TYPES.EmailProviderService).to(EmailProviderService).inSingletonScope();
container.bind<NewsletterEmailService>(TYPES.NewsletterEmailService).to(NewsletterEmailService).inSingletonScope();
container.bind<SubscriptionEmailService>(TYPES.SubscriptionEmailService).to(SubscriptionEmailService).inSingletonScope();
container.bind<SubscriberManagementService>(TYPES.SubscriberManagementService).to(SubscriberManagementService).inSingletonScope();

// Main facade service
container.bind<IEmailService>(TYPES.EmailService).to(EmailService).inSingletonScope();
```

## Testing Strategy

### Unit Tests Structure
```
test/
├── email/
│   ├── email-provider.service.test.ts
│   ├── newsletter-email.service.test.ts
│   ├── subscription-email.service.test.ts
│   ├── subscriber-management.service.test.ts
│   └── email.service.test.ts        # Tests facade delegation
```

### Testing Approach
1. **Service-specific tests**: Test each specialized service in isolation
2. **Facade tests**: Test that the main EmailService correctly delegates to child services
3. **Provider tests**: Test both Resend and Nodemailer implementations
4. **Integration tests**: Test the services working together with real email providers

## Performance Considerations

- **Singleton Scope**: All email services use singleton scope for better performance
- **Provider Connection Reuse**: All services share the same provider instances
- **Efficient Batching**: Each provider optimizes batch sizes for its platform
- **Smart Rate Limiting**: Different limits for Gmail vs Resend

## Provider-Specific Features

### Development (Gmail + Nodemailer)
- **Batch Size**: 10 emails per batch
- **Rate Limiting**: Respects Gmail's stricter limits
- **From Address**: Uses Gmail account directly
- **Benefits**: Free testing, real email delivery

### Production (Resend)
- **Batch Size**: 100 emails per batch
- **Rate Limiting**: Optimized for Resend's higher limits
- **From Address**: Professional branded emails
- **Benefits**: Better deliverability, analytics, scalability

## Future Enhancements

1. **Template Service**: Separate email template management
2. **Analytics Service**: Email performance tracking and reporting
3. **Queue Service**: Background email processing with Redis
4. **A/B Testing**: Split testing for email content
5. **Bounce Handling**: Process email bounces and update subscriber status
6. **Advanced Segmentation**: Subscriber list management with tags/segments

## Error Handling

Each service maintains consistent error handling:
- Provider-specific error messages
- Proper error propagation through the facade
- Graceful degradation for provider failures
- Detailed logging with service context

## Security Considerations

- **Environment Variables**: Sensitive credentials stored securely
- **Token Generation**: Secure unsubscribe token creation
- **Provider Validation**: Proper initialization checks
- **Input Sanitization**: Email address validation
