# Zealy Quest Alert Bot

A Node.js-based Telegram bot and API service that monitors Zealy quest boards for content updates and sends real-time alerts to subscribed users. The bot scrapes quest content, detects changes, and notifies users via Telegram when new quests or updates are available.

## 🚀 Features

- **Automated Content Monitoring**: Continuously monitors Zealy quest boards for content changes
- **Real-time Telegram Alerts**: Sends instant notifications to subscribed users when content updates are detected
- **Smart Change Detection**: Uses diff algorithm to identify only new additions (ignores metadata/timestamp changes)
- **User Subscription Management**: Users can subscribe/unsubscribe via Telegram commands
- **RESTful API**: Full API for frontend integration with user management and content retrieval
- **Server Health Monitoring**: Health check endpoint to monitor scraper activity
- **User Blocking System**: Admin capability to block/unblock users from receiving alerts
- **Content Change Diffing**: Extracts and displays only the new content additions in alerts

## 🛠️ Technology Stack

- **Runtime**: Node.js (ES Modules)
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Telegram Bot**: node-telegram-bot-api
- **HTTP Client**: Axios
- **Scraping**: Jina AI Reader API
- **Package Manager**: pnpm

## 📋 Prerequisites

- Node.js 18.x or higher
- MongoDB Atlas account (or local MongoDB instance)
- Telegram Bot Token (from [@BotFather](https://t.me/botfather))
- pnpm package manager

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd zealy-alert-bot
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   TELEGRAM_BOT_KEY=your_telegram_bot_token
   MONGODB_URI=your_mongodb_connection_string
   PORT=3000
   ```

4. **Start the development server**
   ```bash
   pnpm run dev
   ```

## 📁 Project Structure

```
zealy-alert-bot/
├── src/
│   ├── db/
│   │   └── connect.js          # MongoDB connection configuration
│   ├── helpers/
│   │   └── scraperHelpers.js    # Helper functions for scraping and diffing
│   ├── models/
│   │   ├── User.js             # User model schema
│   │   └── ScrapedContent.js    # Scraped content model schema
│   ├── service/
│   │   └── scrape.js           # Web scraping service
│   ├── tests/
│   │   ├── detectAdditions.js  # Test script for diff function
│   │   └── scrape.js           # Test script for scraper
│   └── index.js                # Main application entry point
├── .env                        # Environment variables (not committed)
├── package.json                # Project dependencies and scripts
├── API_DOCUMENTATION.md        # Detailed API documentation
├── FRONTEND_MIGRATION_GUIDE.md # Frontend integration guide
└── README.md                   # This file
```

## 🤖 Telegram Bot Commands

| Command | Description |
|---------|-------------|
| `/start` | Register and subscribe to quest alerts |
| `/add <url>` | Add a new Zealy quest board URL to monitor |
| `/list` | List all monitored quest boards |
| `/remove <url>` | Remove a quest board from monitoring |
| `/stop` | Unsubscribe from quest alerts |

## 📡 API Endpoints

### GET `/api/scraped-content`
Retrieve all scraped content data from monitored quest boards.

**Response:**
```json
{
  "success": true,
  "count": 10,
  "data": [
    {
      "_id": "string",
      "url": "string",
      "title": "string",
      "description": "string",
      "content": "string",
      "metadata": {},
      "external": {},
      "usage": {},
      "scrapedAt": "ISODate",
      "createdAt": "ISODate",
      "updatedAt": "ISODate"
    }
  ]
}
```

### GET `/api/users`
Retrieve all user data including subscription status.

**Response:**
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "_id": "string",
      "name": "string",
      "username": "string",
      "telegram_chat_id": "string",
      "blocked": false,
      "createdAt": "ISODate",
      "updatedAt": "ISODate"
    }
  ]
}
```

### GET `/api/health`
Get server health status and last successful scrape time.

**Response:**
```json
{
  "success": true,
  "lastScrapeTime": "2024-04-26T18:00:00.000Z",
  "status": "active"
}
```

### PUT `/api/users/:telegram_chat_id/block`
Toggle a user's blocked status to control alert delivery.

**Request Body:**
```json
{
  "blocked": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "User blocked successfully",
  "data": { /* updated user object */ }
}
```

### GET `/api/docs`
Retrieve the full API documentation in JSON format.

### GET `/scraper`
Manually trigger the scraper to check all monitored URLs for changes.

**Response:**
```json
{
  "message": "Scraper Successful",
  "alertsFound": 2,
  "usersNotified": 10,
  "lastScrapeTime": "2024-04-26T18:00:00.000Z"
}
```

## 🔑 Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `TELEGRAM_BOT_KEY` | Telegram bot token from BotFather | Yes | - |
| `MONGODB_URI` | MongoDB connection string | Yes | - |
| `PORT` | Server port number | No | 3000 |

## 🚢 Deployment

### Deploy to Render

1. **Prepare for deployment**
   - Ensure all environment variables are set in Render dashboard
   - MongoDB Atlas should be configured for network access

2. **Set up webhook**
   After deployment, visit: `https://your-app-url.onrender.com/setup`
   This will configure the Telegram webhook and register bot commands.

3. **Set up cron job** (optional)
   Configure a cron job in Render to periodically trigger the scraper:
   ```
   https://your-app-url.onrender.com/scraper
   ```

### Manual Deployment

1. Build the application
2. Deploy to your hosting provider
3. Set environment variables
4. Run the setup endpoint to configure webhook
5. Set up a cron job or scheduler to trigger the scraper endpoint

## 📊 Data Models

### User
```typescript
{
  _id: string;              // MongoDB ObjectId
  name: string;             // User's first name
  username: string;         // Telegram username (unique)
  telegram_chat_id: string; // Telegram chat ID for notifications (unique)
  blocked: boolean;         // Subscription status (default: false)
  createdAt: string;        // ISO timestamp
  updatedAt: string;        // ISO timestamp
}
```

### ScrapedContent
```typescript
{
  _id: string;              // MongoDB ObjectId
  url: string;             // Monitored URL (unique)
  title: string;           // Quest board title
  description: string;     // Quest board description
  content: string;         // Main quest content (compared for changes)
  metadata: object;        // Page metadata
  external: object;        // External resources
  usage: object;           // Usage statistics
  scrapedAt: Date;         // Last scrape timestamp
  createdAt: string;       // First added timestamp
  updatedAt: string;       // Last content update timestamp
}
```

## 🔍 How It Works

1. **User Registration**: Users send `/start` to the Telegram bot to register
2. **URL Monitoring**: Admins or users add Zealy quest board URLs using `/add`
3. **Content Scraping**: The scraper fetches content from monitored URLs using Jina AI
4. **Change Detection**: Compares new content with stored content using smart diff algorithm
5. **Alert Delivery**: Sends Telegram alerts with only the new additions to subscribed users
6. **Health Monitoring**: `/api/health` endpoint provides server status for frontend monitoring

## 🧪 Testing

### Test the scraper
```bash
node src/tests/scrape.js <url>
```

### Test the diff function
```bash
node src/tests/detectAdditions.js
```

## 📝 API Documentation

For detailed API documentation including request/response examples, see [API_DOCUMENTATION.md](./API_DOCUMENTATION.md).

## 🔄 Frontend Integration

For frontend integration guide and migration instructions, see [FRONTEND_MIGRATION_GUIDE.md](./FRONTEND_MIGRATION_GUIDE.md).

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## ⚠️ Important Notes

- All API endpoints support CORS from any origin
- Responses are sorted by `createdAt` in descending order (newest first)
- Only the `content` field is compared for changes (ignores metadata, timestamps)
- Blocked users (`blocked: true`) will not receive Telegram alerts
- The scraper uses Jina AI Reader API for content extraction
- Frontend integration remains backward compatible with existing implementations

## 📄 License

ISC

## 🆘 Support

For issues, questions, or support, contact [@vicdevman](https://t.me/vicdevman)

## 🙏 Acknowledgments

- [Jina AI](https://jina.ai/) for the Reader API
- [Telegram](https://telegram.org/) for the bot platform
- [MongoDB](https://www.mongodb.com/) for the database
- [Zealy](https://zealy.io/) for the quest platform
