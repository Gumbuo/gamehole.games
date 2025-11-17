# Gamehole.games Storage System

## Overview

Gamehole.games now uses a **hybrid storage system** that combines:
- **localStorage** (for fast, local access)
- **Database backend** (for persistent, cross-device storage via Vercel KV)

## How It Works

### For Players

1. **First Visit**: When you load a game, you'll be prompted to enter a username
2. **Your Data**: All game progress is saved both locally AND to the server
3. **Cross-Device**: Login with the same username on any device to access your saved progress
4. **Offline Play**: Games work offline using localStorage, and sync when you're back online

### For Developers

#### API Endpoint: `/api/game-storage`

**GET** - Fetch saved game data
```
GET /api/game-storage?userId=username&file=savefile
```

**POST** - Save game data
```json
POST /api/game-storage
{
  "userId": "username",
  "file": "savefile",
  "data": { ...gameData }
}
```

**PATCH** - Update specific keys
```json
PATCH /api/game-storage
{
  "userId": "username",
  "file": "savefile",
  "updates": { "score": 1000 }
}
```

**DELETE** - Clear saved data
```
DELETE /api/game-storage?userId=username&file=savefile
```

#### Storage Bridge

The `storage-bridge.js` file wraps GDevelop's storage functions to automatically sync with the backend:

- `gdjs.evtTools.storage.writeNumberInJSONFile()` → Synced
- `gdjs.evtTools.storage.writeStringInJSONFile()` → Synced
- `gdjs.evtTools.storage.deleteElementFromJSONFile()` → Synced
- `gdjs.evtTools.storage.clearJSONFile()` → Synced

Changes are debounced (1 second delay) to avoid excessive API calls.

#### Adding to Games

To add persistent storage to a game, include these scripts in your game's HTML:

```html
<!-- Login UI - Nice looking login modal -->
<script src="/login-ui.js" crossorigin="anonymous"></script>

<!-- Storage Bridge - Syncs localStorage with database -->
<script src="/storage-bridge.js" crossorigin="anonymous"></script>
```

Place them after your game's core scripts but before game initialization.

#### Manual Control

Access the storage bridge via JavaScript console:

```javascript
// Change user
GameholeStorageBridge.changeUser('newUsername');

// Get current user
GameholeStorageBridge.getCurrentUser();

// Force immediate sync
GameholeStorageBridge.forceSync('savefile');

// Logout
GameholeStorageBridge.logout();
```

## Data Storage

All game data is stored in Vercel KV with the key structure:
```
gumbuo:game_storage:{userId}:{filename}
```

Example:
```
gumbuo:game_storage:player123:savegame
```

## Benefits

✅ **Persistent**: Data survives browser cache clearing
✅ **Cross-Device**: Access your game from any device
✅ **Automatic**: No code changes needed in GDevelop games
✅ **Fast**: localStorage cache for instant access
✅ **Reliable**: Automatic syncing with debouncing

## Migration

Existing localStorage data is automatically migrated on first login. The system:
1. Checks for existing localStorage data
2. Loads server data
3. Merges both (server data takes priority)
4. Saves merged data back to server

## Security Notes

- Usernames are converted to lowercase and trimmed
- No password system currently (username-based only)
- Data is transmitted over HTTPS
- Consider adding password protection for production

## Future Enhancements

- [ ] Password protection for usernames
- [ ] Multiple save slots per user
- [ ] Cloud backup/restore UI
- [ ] Data encryption
- [ ] Account linking with email/social
