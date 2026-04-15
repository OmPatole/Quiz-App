# Quiz App Production Deployment Guide

## Current Issue: 502 Bad Gateway

Your frontend on port 80 cannot reach the backend on port 5000. This happens because:
1. Backend is not running on port 5000, OR
2. Backend is running but web server proxy is misconfigured, OR
3. Port 5000 is blocked by firewall

## Quick Fix (Immediate Steps)

### 1. Verify backend is running on port 5000

```bash
# SSH into your production server
ssh user@43.205.240.212

# Check if port 5000 is listening
ss -ltnp | grep :5000

# If nothing shows, backend isn't running
```

### 2. Start backend manually (temporary)

```bash
cd /home/om/Documents/Projects/Quiz-App/server
npm install
npm start
```

Expected output:
```
Server is running on port 5000
MongoDB Connected: 127.0.0.1
✅ Secure System Administrator exists
```

### 3. Test backend connectivity from web server

```bash
curl http://127.0.0.1:5000/api/health
# Should return: {"status":"OK","message":"Server is running"}
```

If you get "connection refused", backend isn't running.

### 4. Set up Nginx reverse proxy

```bash
# Copy Nginx config
sudo cp nginx.conf /etc/nginx/sites-available/quiz-app
sudo ln -sf /etc/nginx/sites-available/quiz-app /etc/nginx/sites-enabled/quiz-app
sudo rm -f /etc/nginx/sites-enabled/default

# Test config
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

### 5. Test the full chain

```bash
# Test backend directly
curl http://127.0.0.1:5000/api/health

# Test through Nginx proxy
curl http://43.205.240.212/api/health

# Should both return: {"status":"OK","message":"Server is running"}
```

## Permanent Setup (Recommended)

### Option A: Using PM2 (Recommended for Node.js)

```bash
# Install PM2 globally
npm install -g pm2

# Start backend
cd /home/om/Documents/Projects/Quiz-App/server
pm2 start server.js --name "quiz-backend"

# Make it auto-restart
pm2 save
pm2 startup

# Monitor
pm2 logs quiz-backend
pm2 status
```

### Option B: Using systemd service

```bash
# Copy service file
sudo cp quiz-app-backend.service /etc/systemd/system/

# Enable and start
sudo systemctl daemon-reload
sudo systemctl enable quiz-app-backend
sudo systemctl start quiz-app-backend

# Check status
sudo systemctl status quiz-app-backend
sudo journalctl -u quiz-app-backend -f
```

### Deploy frontend

```bash
cd /home/om/Documents/Projects/Quiz-App/client
npm install
npm run build

# Copy to web root
sudo mkdir -p /var/www/quiz-app
sudo cp -r dist/* /var/www/quiz-app/
```

## Automated Deployment Script

I've created `deploy.sh` which does all of the above automatically:

```bash
chmod +x deploy.sh
sudo ./deploy.sh
```

## Architecture After Setup

```
User Browser (http://43.205.240.212)
          ↓
    Nginx on Port 80
          ↓
    ├─ /api → Backend (127.0.0.1:5000)
    └─ / → Frontend (dist/)
          ↓
    MongoDB (127.0.0.1:27017)
```

## Firewall Rules Needed

```bash
# If using UFW (Ubuntu Firewall)
sudo ufw allow 80/tcp      # HTTP for Nginx
sudo ufw allow 443/tcp     # HTTPS (future)
sudo ufw allow 5000/tcp    # Backend (optional, for debug only)
sudo ufw allow 27017/tcp   # MongoDB (if remote)
sudo ufw status
```

## HTTPS Setup (Next Step)

Once HTTP is working, secure with HTTPS:

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d 43.205.240.212

# Auto-renewal
sudo systemctl enable certbot.timer
```

## Troubleshooting

### 502 Bad Gateway
- Backend not running: `systemctl status quiz-app-backend`
- Port 5000 blocked: `sudo ufw allow 5000`
- MongoDB not running: `sudo systemctl status mongod`

### Frontend not loading
- Check Nginx syntax: `sudo nginx -t`
- Check Nginx logs: `sudo tail -f /var/log/nginx/error.log`
- Check dist folder: `ls /var/www/quiz-app`

### CORS errors
- All requests now go through same origin (Nginx), so no CORS
- If you see CORS errors in dev mode, make sure `npm run dev` is running with Vite proxy

### Login not working
- Check backend logs: `pm2 logs quiz-backend` or `sudo journalctl -u quiz-app-backend -f`
- Verify admin creds: PRN=SYS_ADMIN, Password=Secure_Admin_2026!
- Check JWT_SECRET in /server/.env
