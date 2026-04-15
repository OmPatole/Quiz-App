#!/bin/bash
# Production Deployment Script for Quiz App
# Run this on your production server after pulling code

set -e

echo "🚀 Quiz App Production Deployment"
echo "=================================="

# 1. Backend setup
echo "📦 Setting up backend..."
cd /home/om/Documents/Projects/Quiz-App/server
npm install
npm install -g pm2

# 2. Start backend with PM2
echo "🔧 Starting backend service with PM2..."
pm2 delete "quiz-backend" 2>/dev/null || true
pm2 start server.js --name "quiz-backend" --env production
pm2 save
pm2 startup

# 3. Frontend setup
echo "📦 Setting up frontend..."
cd /home/om/Documents/Projects/Quiz-App/client
npm install
npm run build

# 4. Deploy frontend to Nginx
echo "📂 Deploying frontend to /var/www/quiz-app..."
sudo mkdir -p /var/www/quiz-app
sudo cp -r dist/* /var/www/quiz-app/

# 5. Configure Nginx
echo "⚙️  Configuring Nginx..."
sudo cp /home/om/Documents/Projects/Quiz-App/nginx.conf /etc/nginx/sites-available/quiz-app
sudo ln -sf /etc/nginx/sites-available/quiz-app /etc/nginx/sites-enabled/quiz-app

# Remove default site if exists
sudo rm -f /etc/nginx/sites-enabled/default

# Test Nginx config
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx

echo ""
echo "✅ Deployment complete!"
echo ""
echo "Checklist:"
echo "  ✓ Backend running on port 5000 (PM2)"
echo "  ✓ Frontend deployed to /var/www/quiz-app"
echo "  ✓ Nginx configured for reverse proxy"
echo ""
echo "Test endpoints:"
echo "  Backend health: curl http://127.0.0.1:5000/api/health"
echo "  Frontend: http://43.205.240.212"
echo "  API via Nginx: curl http://43.205.240.212/api/health"
echo ""
echo "Monitor backend:"
echo "  pm2 logs quiz-backend"
echo "  pm2 status"
