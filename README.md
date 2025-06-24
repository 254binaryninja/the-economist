# 📊 The Economist AI - Economic Analysis Platform

> **⚠️ Work in Progress**: This project is currently under active development. Many features are being implemented and improved.

An AI-powered economic analysis platform that provides comprehensive market insights, economic indicators, news aggregation, and interactive charts. Built with Next.js, the platform integrates multiple economic data sources and offers various economic perspectives from Keynesian to Neoclassical viewpoints.

## 🚀 Features

### ✅ Currently Available
- **Multi-Perspective Economic Analysis**: Switch between different economic schools of thought (Keynesian, Classical, Marxist, etc.)
- **Workspace Management**: Create and manage multiple economic research workspaces
- **Vault System**: Document storage and management with semantic search capabilities
- **Economic News Aggregation**: Real-time news from Marketaux and Finnhub APIs
- **Interactive Charts**: Data visualization using Recharts
- **Authentication**: Secure user management with Clerk
- **Database**: PostgreSQL with Supabase and Drizzle ORM
- **Redis Context Management**: Conversation context caching

### 🔧 In Development
- **AI Tool Calling System**: Enhanced economic indicator fetching and analysis
- **Economic Indicators**: Integration with Trading Economics API (currently being fixed)
- **Stock Market Data**: Polygon.io integration for real-time market data
- **Automated Newsletters**: Scheduled economic updates and insights
- **Advanced Analytics**: Enhanced data processing and visualization

### 📋 Planned Features
- **Portfolio Analysis**: Investment portfolio tracking and analysis
- **Economic Forecasting**: AI-powered economic predictions
- **Custom Indicators**: User-defined economic metrics
- **Real-time Alerts**: Market movement notifications
- **API Integrations**: Additional data sources (Alpha Vantage, FRED, etc.)
- **Export Capabilities**: PDF reports and data export

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 15 with App Router
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI primitives
- **Charts**: Recharts
- **State Management**: Zustand
- **Forms**: React Hook Form with Zod validation

### Backend
- **Runtime**: Node.js
- **Database**: PostgreSQL (Supabase)
- **ORM**: Drizzle ORM
- **Authentication**: Clerk
- **Caching**: Redis
- **AI**: Google Gemini AI
- **Dependency Injection**: Inversify

### APIs & External Services
- **Trading Economics**: Economic indicators (⚠️ integration being fixed)
- **Marketaux**: Financial news
- **Finnhub**: Market news
- **Polygon.io**: Stock market data (planned)
- **Supabase**: Database and real-time features
- **Pinecone**: Vector database for document search

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- pnpm (recommended) or npm
- PostgreSQL database (or Supabase account)
- Redis instance

### Environment Variables
Create a `.env.local` file with the following variables:

```bash
# Database
DATABASE_URL=your_postgresql_url
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Authentication (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# AI (Google Gemini)
GOOGLE_GENERATIVE_AI_API_KEY=your_google_ai_key
NEXT_PUBLIC_GOOGLE_GENERATIVE_AI_API_KEY=your_google_ai_key

# News APIs
MARKETAUX_API_TOKEN=your_marketaux_token
FINNHUB_API_TOKEN=your_finnhub_token

# Economic Data (Currently being fixed)
NEXT_PUBLIC_TRADINGECONOMICS_KEY=your_trading_economics_key

# Pinecone (Vector Database)
PINECONE_API_KEY=your_pinecone_key

# Email (Optional)
EMAIL_USER=your_email
EMAIL_PASSWORD=your_email_password
```

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/254binaryninja/the-economist.git
cd the-economist
```

2. **Install dependencies**
```bash
pnpm install

```

3. **Set up the database**
```bash
pnpm run generate
pnpm run migrate
```

4. **Start the development server**
```bash
pnpm run dev
```

5. **Open your browser**
Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication pages
│   ├── (root)/            # Main application pages
│   └── api/               # API routes
├── components/            # React components
│   ├── ai/               # AI chat components
│   ├── ui/               # UI primitives
│   ├── vault/            # Vault management
│   └── workspace/        # Workspace management
├── lib/                  # Utilities and tools
│   ├── tools/           # AI tools for economic analysis
│   ├── prompts/         # AI prompts for different perspectives
│   └── utils/           # Helper utilities
├── src/                 # Core business logic
│   ├── config/          # Dependency injection setup
│   ├── controllers/     # Business logic controllers
│   ├── domain/          # Domain models and services
│   └── repository/      # Data access layer
├── database/            # Database schema and migrations
├── hooks/               # Custom React hooks
├── store/               # State management
└── types/               # TypeScript type definitions
```


## 🤝 Contributing

**We welcome contributions!** This project is open-source and we'd love your help in making it better.

### How to Contribute

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes**
4. **Write or update tests**
5. **Ensure your code follows the project's coding standards**
6. **Commit your changes**
   ```bash
   git commit -m "feat: add your feature description"
   ```
7. **Push to your branch**
   ```bash
   git push origin feature/your-feature-name
   ```
8. **Open a Pull Request**

### Areas Where We Need Help

#### 🔧 Current Issues to Fix
- **Trading Economics API Integration**: Fix authentication and data fetching
- **AI Tool Calling System**: Improve reliability and error handling
- **Chart Data Processing**: Enhance data transformation for visualizations

#### 🆕 New Features to Implement
- **Polygon.io Integration**: Add stock market data fetching
- **Automated Newsletter System**: Create scheduled economic reports
- **Advanced Economic Indicators**: Add more data sources and metrics
- **Real-time Data Streaming**: Implement WebSocket connections for live data
- **Mobile Responsiveness**: Improve mobile user experience

#### 🎨 UI/UX Improvements
- **Accessibility**: Improve ARIA labels and keyboard navigation

#### 📚 Documentation
- **API Documentation**: Document all API endpoints
- **Component Documentation**: Add Storybook or similar
- **User Guide**: Create comprehensive user documentation
- **Developer Guide**: Detailed setup and development guide

### Coding Standards

- **TypeScript**: Strict typing required
- **ESLint**: Follow the project's ESLint configuration
- **Prettier**: Code formatting is handled automatically
- **Conventional Commits**: Use conventional commit message format
- **Testing**: Write tests for new features and bug fixes

### Development Workflow

1. **Issues**: Check existing issues or create a new one
2. **Discussion**: Discuss implementation approach in the issue
3. **Development**: Follow the coding standards
4. **Testing**: Ensure all tests pass
5. **Documentation**: Update relevant documentation
6. **Review**: Submit PR for code review

## 📊 Current Status & Roadmap

### Phase 1: Foundation (Current)
- [x] Basic project setup
- [x] Authentication system
- [x] Database schema
- [x] Basic UI components
- [x] Workspace management
- [x] News aggregation
- [ ] Fix tool calling system
- [ ] Complete economic indicators integration

### Phase 2: Core Features (Next)
- [ ] Polygon.io stock market integration
- [ ] Automated newsletter system
- [ ] Enhanced AI analysis
- [ ] Real-time data streaming
- [ ] Advanced charting capabilities

### Phase 3: Advanced Features (Future)
- [ ] Portfolio management
- [ ] Economic forecasting
- [ ] Custom indicators
- [ ] Mobile application
- [ ] Public API

## 🐛 Known Issues

- **Trading Economics API**: Authentication issues being resolved
- **Tool Calling**: Some AI tools need reliability improvements
- **Chart Rendering**: Occasional data formatting issues
- **Mobile View**: Some components need responsive improvements

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Trading Economics** for economic data
- **Marketaux & Finnhub** for financial news
- **Google Gemini** for AI capabilities
- **Supabase** for database and real-time features
- **Vercel** for hosting and deployment

## 📞 Contact & Support

- **Issues**: [GitHub Issues](https://github.com/254binaryninja/the-economist/issues)
- **Discussions**: [GitHub Discussions](https://github.com/254binaryninja/the-economist/discussions)
- **Email**: arnoldmusandu@gmail.com

---

**⭐ If you find this project useful, please consider giving it a star!**

**🤝 Contributions, issues, and feature requests are welcome!**
