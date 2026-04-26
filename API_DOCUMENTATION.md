# Zealy Quest Alert Bot - API Documentation

## Overview
This API provides endpoints for accessing scraped Zealy quest data and user information. All endpoints support CORS from any origin for easy frontend integration.

## Base URL
```
https://zealy-quest-alert-bot.onrender.com
```

## Authentication
No authentication required for public endpoints.

## Endpoints

### 1. Get All Scraped Content
Returns all scraped content data from monitored Zealy sprints.

**Endpoint:** `GET /api/scraped-content`

**Response:**
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "_id": "string",
      "url": "https://zealy.io/cw/solstice-finance/questboard",
      "title": "Join Solstice",
      "description": "",
      "content": "string (markdown content)",
      "metadata": { ... },
      "external": { ... },
      "usage": { ... },
      "scrapedAt": "ISODate",
      "createdAt": "ISODate",
      "updatedAt": "ISODate"
    }
  ]
}
```

**Example Request:**
```bash
curl https://zealy-quest-alert-bot.onrender.com/api/scraped-content
```

**Example Response (JavaScript):**
```javascript
fetch('https://zealy-quest-alert-bot.onrender.com/api/scraped-content')
  .then(res => res.json())
  .then(data => {
    console.log(`Found ${data.count} monitored sprints`);
    data.data.forEach(item => {
      console.log(`URL: ${item.url}`);
      console.log(`Last updated: ${item.updatedAt}`);
    });
  });
```

---

### 2. Get All Users
Returns all registered users with their Telegram details.

**Endpoint:** `GET /api/users`

**Response:**
```json
{
  "success": true,
  "count": 10,
  "data": [
    {
      "_id": "string",
      "name": "John",
      "username": "johndoe",
      "telegram_chat_id": "123456789",
      "createdAt": "ISODate",
      "updatedAt": "ISODate"
    }
  ]
}
```

**Example Request:**
```bash
curl https://zealy-quest-alert-bot.onrender.com/api/users
```

**Example Response (JavaScript):**
```javascript
fetch('https://zealy-quest-alert-bot.onrender.com/api/users')
  .then(res => res.json())
  .then(data => {
    console.log(`Total users: ${data.count}`);
    data.data.forEach(user => {
      console.log(`User: ${user.username} (@${user.name})`);
    });
  });
```

---

### 3. Get Server Health
Returns server health status and last successful scrape time.

**Endpoint:** `GET /api/health`

**Response:**
```json
{
  "success": true,
  "lastScrapeTime": "2024-04-26T18:00:00.000Z" or null,
  "status": "active" or "pending"
}
```

**Example Request:**
```bash
curl https://zealy-quest-alert-bot.onrender.com/api/health
```

---

### 4. Toggle User Blocked Status
Toggle a user's blocked status to control whether they receive Telegram alerts.

**Endpoint:** `PUT /api/users/:telegram_chat_id/block`

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
  "data": {
    "_id": "string",
    "name": "John",
    "username": "johndoe",
    "telegram_chat_id": "123456789",
    "blocked": true,
    "createdAt": "ISODate",
    "updatedAt": "ISODate"
  }
}
```

**Example Request:**
```bash
curl -X PUT https://zealy-quest-alert-bot.onrender.com/api/users/123456789/block \
  -H "Content-Type: application/json" \
  -d '{"blocked": true}'
```

---

### 5. Get API Documentation
Returns this API documentation in JSON format.

**Endpoint:** `GET /api/docs`

**Response:**
```json
{
  "success": true,
  "message": "Zealy Quest Alert Bot API Documentation",
  "version": "1.0.0",
  "baseUrl": "https://zealy-quest-alert-bot.onrender.com",
  "endpoints": [ ... ],
  "dataModels": {
    "ScrapedContent": {
      "url": "string (unique) - The monitored URL",
      "title": "string - Sprint title from Zealy",
      "description": "string - Sprint description",
      "content": "string - Main quest content (compared for changes)",
      "metadata": "object - Page metadata",
      "external": "object - External resources",
      "usage": "object - Usage stats",
      "scrapedAt": "ISODate - When content was scraped",
      "createdAt": "ISODate - When the URL was first added",
      "updatedAt": "ISODate - When the content was last updated"
    },
    ...
  },
  "notes": [ ... ]
}
```

---

### 6. Trigger Scraper Job
Manually triggers the scraper to check all monitored URLs for changes and send Telegram alerts if content changes are detected.

**Endpoint:** `GET /scraper`

**Response:**
```json
{
  "message": "Scraper Successful",
  "alertsFound": 2,
  "usersNotified": 10
}
```

**Example Request:**
```bash
curl https://zealy-quest-alert-bot.onrender.com/scraper
```

---

## Data Models

### ScrapedContent
```typescript
{
  url: string;              // The monitored URL (unique)
  title: string;            // Sprint title from Zealy
  description: string;     // Sprint description
  content: string;          // Main quest content (compared for changes)
  metadata: object;         // Page metadata
  external: object;         // External resources
  usage: object;            // Usage stats
  scrapedAt: Date;          // ISO timestamp when content was scraped
  createdAt: string;        // ISO timestamp when URL was first added
  updatedAt: string;        // ISO timestamp when content was last updated
}
```

### User
```typescript
{
  _id: string;              // MongoDB ObjectId
  name: string;             // User's first name
  username: string;         // Telegram username (unique)
  telegram_chat_id: string; // Telegram chat ID for notifications (unique)
  blocked: boolean;         // Whether user is blocked from receiving alerts (default: false)
  createdAt: string;        // ISO timestamp when user was registered
  updatedAt: string;        // ISO timestamp when user was last updated
}
```

---

## Frontend Integration Guide

### React Example

```jsx
import { useState, useEffect } from 'react';

function ZealyDashboard() {
  const [scrapedContent, setScrapedContent] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [contentRes, usersRes] = await Promise.all([
        fetch('https://zealy-quest-alert-bot.onrender.com/api/scraped-content'),
        fetch('https://zealy-quest-alert-bot.onrender.com/api/users')
      ]);

      const contentData = await contentRes.json();
      const usersData = await usersRes.json();

      setScrapedContent(contentData.data);
      setUsers(usersData.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1>Zealy Quest Monitor</h1>
      
      <section>
        <h2>Monitored Sprints ({scrapedContent.length})</h2>
        {scrapedContent.map(item => (
          <div key={item.url}>
            <h3>{item.url}</h3>
            <p>Last updated: {new Date(item.updatedAt).toLocaleString()}</p>
          </div>
        ))}
      </section>

      <section>
        <h2>Registered Users ({users.length})</h2>
        {users.map(user => (
          <div key={user._id}>
            <p>{user.name} (@{user.username})</p>
          </div>
        ))}
      </section>
    </div>
  );
}
```

### Vue.js Example

```vue
<template>
  <div>
    <h1>Zealy Quest Monitor</h1>
    
    <section v-if="loading">Loading...</section>
    
    <section v-else>
      <h2>Monitored Sprints ({{ scrapedContent.length }})</h2>
      <div v-for="item in scrapedContent" :key="item.url">
        <h3>{{ item.url }}</h3>
        <p>Last updated: {{ formatDate(item.updatedAt) }}</p>
      </div>

      <h2>Registered Users ({{ users.length }})</h2>
      <div v-for="user in users" :key="user._id">
        <p>{{ user.name }} (@{{ user.username }})</p>
      </div>
    </section>
  </div>
</template>

<script>
export default {
  data() {
    return {
      scrapedContent: [],
      users: [],
      loading: true
    };
  },
  async mounted() {
    await this.fetchData();
  },
  methods: {
    async fetchData() {
      try {
        const [contentRes, usersRes] = await Promise.all([
          fetch('https://zealy-quest-alert-bot.onrender.com/api/scraped-content'),
          fetch('https://zealy-quest-alert-bot.onrender.com/api/users')
        ]);

        const contentData = await contentRes.json();
        const usersData = await usersRes.json();

        this.scrapedContent = contentData.data;
        this.users = usersData.data;
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        this.loading = false;
      }
    },
    formatDate(dateString) {
      return new Date(dateString).toLocaleString();
    }
  }
};
</script>
```

---

## Notes

- All endpoints support CORS from any origin
- Responses are sorted by `createdAt` in descending order (newest first)
- The `/scraper` endpoint automatically sends Telegram alerts when content changes are detected
- Only the 'content' field is compared for changes (ignores metadata, external, usage, and timestamps)
- Blocked users (blocked: true) will not receive Telegram alerts
- Use `/start` command to resubscribe (sets blocked: false)
- Use `/stop` command to unsubscribe (sets blocked: true)
- Telegram bot commands: `/start`, `/add <url>`, `/list`, `/remove <url>`, `/stop`
- If no URLs are being monitored, the scraper returns early without attempting to scrape
- The `/api/health` endpoint provides last successful scrape time for server monitoring

## Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Error message description"
}
```

HTTP Status Codes:
- `200` - Success
- `500` - Internal server error

## Support

For issues or questions, contact @vicdevman on X (Twitter).
