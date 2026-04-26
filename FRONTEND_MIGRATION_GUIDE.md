# Frontend Migration Guide

## Overview
This guide helps you migrate your frontend to use the new API features added to the Zealy Quest Alert Bot. The existing API endpoints remain backward compatible, so your current integration will continue to work without changes.

## What's New

### 1. User Model Update
The `User` model now includes a `blocked` field:
- **New field:** `blocked: boolean` (default: `false`)
- **Purpose:** Controls whether a user receives Telegram alerts
- **Impact:** Users with `blocked: true` will not receive alerts

### 2. New API Endpoints

#### GET /api/health
Returns server health status and last successful scrape time.

**Response:**
```json
{
  "success": true,
  "lastScrapeTime": "2024-04-26T18:00:00.000Z" or null,
  "status": "active" or "pending"
}
```

**Use case:** Monitor server activity and verify the scraper is running.

#### PUT /api/users/:telegram_chat_id/block
Toggle a user's blocked status.

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

**Use case:** Allow admins to block/unblock users from receiving alerts via the frontend.

### 3. Scraper Response Update
The `/scraper` endpoint now includes `lastScrapeTime` in its response:

**New Response:**
```json
{
  "message": "Scraper Successful",
  "alertsFound": 2,
  "usersNotified": 10,
  "lastScrapeTime": "2024-04-26T18:00:00.000Z"
}
```

## Migration Steps

### Step 1: Update User Data Handling (Optional)
If your frontend displays user data, update it to handle the new `blocked` field:

**Before:**
```javascript
// Display user info
<p>{user.name} (@{user.username})</p>
```

**After:**
```javascript
// Display user info with blocked status
<p>{user.name} (@{user.username})</p>
{user.blocked && <span className="badge">Blocked</span>}
```

### Step 2: Add Server Health Monitoring (Recommended)
Add a health check component to monitor server status:

```javascript
function ServerHealth() {
  const [health, setHealth] = useState(null);

  useEffect(() => {
    const fetchHealth = async () => {
      const res = await fetch('https://zealy-quest-alert-bot.onrender.com/api/health');
      const data = await res.json();
      setHealth(data);
    };

    fetchHealth();
    const interval = setInterval(fetchHealth, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  if (!health) return <div>Loading health status...</div>;

  return (
    <div>
      <h3>Server Status: {health.status}</h3>
      {health.lastScrapeTime && (
        <p>Last scrape: {new Date(health.lastScrapeTime).toLocaleString()}</p>
      )}
    </div>
  );
}
```

### Step 3: Add User Block/Unblock Functionality (Optional)
If you want to allow blocking users from the frontend:

```javascript
async function toggleUserBlock(telegramChatId, blocked) {
  const res = await fetch(
    `https://zealy-quest-alert-bot.onrender.com/api/users/${telegramChatId}/block`,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ blocked })
    }
  );
  
  const data = await res.json();
  if (data.success) {
    // Refresh user list or update local state
    console.log(data.message);
  }
}

// Usage in component
<button onClick={() => toggleUserBlock(user.telegram_chat_id, true)}>
  Block User
</button>
<button onClick={() => toggleUserBlock(user.telegram_chat_id, false)}>
  Unblock User
</button>
```

### Step 4: Update Scraper Response Handling (Optional)
If you use the scraper response, update it to handle the new `lastScrapeTime` field:

```javascript
const triggerScraper = async () => {
  const res = await fetch('https://zealy-quest-alert-bot.onrender.com/scraper');
  const data = await res.json();
  
  console.log(`Alerts found: ${data.alertsFound}`);
  console.log(`Users notified: ${data.usersNotified}`);
  console.log(`Last scrape: ${data.lastScrapeTime}`);
};
```

## Backward Compatibility

### Existing Endpoints - No Changes Required
The following endpoints remain unchanged and fully backward compatible:

- `GET /api/scraped-content` - Same response structure
- `GET /api/users` - Now includes `blocked` field, but existing code will ignore it
- `GET /api/docs` - Updated with new endpoints, but existing structure preserved

### No Breaking Changes
- All existing API responses maintain their original structure
- New fields are additive only
- Existing frontend code will continue to work without modifications

## Database Migration

### Manual Update Required
Since you mentioned there's only one user, you'll need to manually add the `blocked` field to existing users in MongoDB:

**Option 1: Using MongoDB Atlas UI**
1. Go to your MongoDB Atlas dashboard
2. Navigate to the `users` collection
3. Edit each document and add: `"blocked": false`

**Option 2: Using MongoDB Shell**
```javascript
db.users.updateMany(
  {},
  { $set: { blocked: false } },
  { upsert: false }
)
```

**Option 3: Using a Migration Script**
Create a temporary script to update existing users:

```javascript
// migrate-users.js
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from './src/models/User.js';

dotenv.config();

async function migrate() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  const result = await User.updateMany(
    {},
    { $set: { blocked: false } }
  );
  
  console.log(`Updated ${result.modifiedCount} users`);
  await mongoose.disconnect();
}

migrate().catch(console.error);
```

Run with: `node migrate-users.js`

## Testing Checklist

After migration, verify:

- [ ] Existing `/api/scraped-content` endpoint works as before
- [ ] Existing `/api/users` endpoint works and includes `blocked` field
- [ ] New `/api/health` endpoint returns correct data
- [ ] New `/api/users/:id/block` endpoint can toggle user status
- [ ] Scraper response includes `lastScrapeTime`
- [ ] Frontend displays user data correctly (with or without `blocked` field)
- [ ] Server health monitoring displays correctly

## Summary

**Required Actions:**
1. Manually add `blocked: false` to existing user in MongoDB

**Optional Enhancements:**
1. Display user blocked status in frontend
2. Add server health monitoring component
3. Add user block/unblock functionality
4. Update scraper response handling to use `lastScrapeTime`

**No Breaking Changes:**
- All existing API endpoints remain compatible
- Existing frontend code will continue to work
- New features are additive only
