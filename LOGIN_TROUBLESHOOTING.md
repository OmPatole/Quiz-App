# Login Issues - Troubleshooting Guide

## Current Error: `ERR_BLOCKED_BY_CLIENT`

This error means the browser or a browser extension is blocking the API request.

## Quick Fixes (Try in Order)

### 1. **Disable Browser Extensions** ⭐ (Most Common Fix)
The request is being blocked by a browser extension (ad blocker, privacy extension, etc.)

**Steps:**
1. Open your browser in **Incognito/Private mode** (extensions are usually disabled)
2. Try logging in again
3. If it works, the issue is a browser extension

**Common culprits:**
- uBlock Origin
- AdBlock Plus
- Privacy Badger
- Brave Shields
- Any VPN extensions

**Solution:**
- Whitelist `localhost` in your ad blocker
- Or disable the extension for localhost

### 2. **Verify Backend Server is Running**

Check if the server is actually running:

```bash
# In the server folder
cd server
npm run dev
```

You should see:
```
Server is running on port 5000
MongoDB Connected: localhost
✅ Admin user already exists (or created)
```

### 3. **Test API Directly**

Open a new browser tab and visit:
```
http://localhost:5000/api/health
```

You should see:
```json
{"status":"OK","message":"Server is running"}
```

If this doesn't work, the server isn't running properly.

### 4. **Check Environment Variables**

Verify `client/.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

**After changing .env, restart Vite:**
```bash
# In client folder
# Press Ctrl+C to stop
npm run dev
```

### 5. **Clear Browser Cache**

1. Open DevTools (F12)
2. Right-click the refresh button
3. Select "Empty Cache and Hard Reload"

### 6. **Check CORS Configuration**

The server should have CORS enabled. Verify in `server/server.js`:
```javascript
app.use(cors({
    origin: '*',
    credentials: true
}));
```

## Debugging Steps

### Check Browser Console

1. Open DevTools (F12)
2. Go to Console tab
3. Look for the exact error
4. Go to Network tab
5. Try logging in
6. Check if the request to `/api/auth/login` appears
7. Click on it to see details

### Check Server Logs

Look at the terminal running the server. You should see:
- Any incoming requests
- Any errors

## Admin Login Credentials

```
PRN: ADMIN
Password: admin123
```

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| `ERR_BLOCKED_BY_CLIENT` | Disable ad blocker or use incognito mode |
| `Network Error` | Check if server is running on port 5000 |
| `ERR_CONNECTION_REFUSED` | Server not running or wrong port |
| `Invalid credentials` | Check PRN and password (case-sensitive) |
| `CORS error` | Check server CORS configuration |
| Nothing happens | Check browser console for errors |

## Still Not Working?

### Option 1: Use Different Browser
Try Chrome, Firefox, or Edge in incognito mode

### Option 2: Check Firewall
Windows Firewall might be blocking localhost connections:
1. Windows Security → Firewall & network protection
2. Allow an app through firewall
3. Make sure Node.js is allowed

### Option 3: Try Different Port
If port 5000 is blocked, change it:

In `server/.env`:
```env
PORT=3001
```

In `client/.env`:
```env
VITE_API_URL=http://localhost:3001/api
```

Restart both servers.

## Testing Checklist

- [ ] Server is running (`npm run dev` in server folder)
- [ ] Client is running (`npm run dev` in client folder)
- [ ] Browser extensions disabled (or in incognito mode)
- [ ] `.env` file has correct API URL
- [ ] Can access `http://localhost:5000/api/health`
- [ ] No firewall blocking localhost
- [ ] Using correct credentials (ADMIN / admin123)

## Need More Help?

1. Check the server terminal for error messages
2. Check browser DevTools → Console for errors
3. Check browser DevTools → Network tab for failed requests
4. Share the exact error message from the console
