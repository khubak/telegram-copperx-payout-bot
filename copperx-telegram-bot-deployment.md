# Copperx Telegram Payout Bot - Deployment Guide

This document outlines the deployment process for the Copperx Telegram Payout Bot, ensuring a smooth transition from development to production.

## Prerequisites

Before deploying the bot, ensure you have the following:

- A Telegram Bot Token (obtained from BotFather)
- Copperx API credentials
- A Render.com account (or alternative hosting platform)
- Node.js v18+ installed locally
- Yarn package manager

## Deployment Options

### 1. Render.com Deployment (Recommended)

Render provides a simple, scalable platform for hosting Node.js applications with free tier options suitable for this bot.

#### Setup Steps:

1. **Create a `render.yaml` file in your project root:**

```yaml
services:
  - type: web
    name: telegram-copperx-payout-bot
    env: node
    buildCommand: yarn install && yarn build
    startCommand: yarn start:prod
    envVars:
      - key: NODE_ENV
        value: production
      - key: TELEGRAM_BOT_TOKEN
        sync: false
      - key: WEBHOOK_DOMAIN
        sync: false
      - key: COPPERX_API_URL
        value: https://income-api.copperx.io/api
      - key: PUSHER_APP_KEY
        value: e089376087cac1a62785
      - key: PUSHER_APP_CLUSTER
        value: ap1
```

2. **Push your code to GitHub:**

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-github-repo-url>
git push -u origin main
```

3. **Connect to Render:**

   - Create a new account or log in to Render.com
   - Click "New" and select "Blueprint"
   - Connect your GitHub repository
   - Render will automatically detect the `render.yaml` file and set up your service

4. **Configure Environment Variables:**

   - In the Render dashboard, navigate to your service
   - Go to the "Environment" tab
   - Add the following environment variables:
     - `TELEGRAM_BOT_TOKEN`: Your Telegram bot token
     - `WEBHOOK_DOMAIN`: Your Render service URL (e.g., `https://telegram-copperx-payout-bot.onrender.com`)

5. **Deploy the Service:**

   - Render will automatically deploy your service based on the configuration
   - Monitor the deployment logs for any issues

6. **Set Up Telegram Webhook:**
   - Once deployed, set up the Telegram webhook by visiting:
     ```
     https://api.telegram.org/bot<TELEGRAM_BOT_TOKEN>/setWebhook?url=<WEBHOOK_DOMAIN>/webhook
     ```
   - You should receive a confirmation that the webhook was set successfully

### 2. Docker Deployment

For more control over your deployment environment, you can use Docker.

#### Setup Steps:

1. **Create a `Dockerfile` in your project root:**

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY . .
RUN yarn build

CMD ["yarn", "start:prod"]
```

2. **Create a `.dockerignore` file:**

```
node_modules
dist
.git
.env
```

3. **Build and run the Docker image:**

```bash
# Build the image
docker build -t telegram-copperx-payout-bot .

# Run the container
docker run -p 3000:3000 \
  -e NODE_ENV=production \
  -e TELEGRAM_BOT_TOKEN=your_telegram_bot_token \
  -e WEBHOOK_DOMAIN=your_webhook_domain \
  -e COPPERX_API_URL=https://income-api.copperx.io/api \
  -e PUSHER_APP_KEY=e089376087cac1a62785 \
  -e PUSHER_APP_CLUSTER=ap1 \
  telegram-copperx-payout-bot
```

4. **Deploy to a cloud provider:**
   - Push your Docker image to Docker Hub or a private registry
   - Deploy to your preferred cloud provider (AWS, GCP, Azure, etc.)
   - Set up the Telegram webhook as described in the Render deployment section

### 3. Traditional VPS Deployment

If you prefer a more traditional approach, you can deploy to a VPS.

#### Setup Steps:

1. **Provision a VPS** with Ubuntu 20.04 or later

2. **Install Node.js and Yarn:**

```bash
# Update package lists
sudo apt update

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install Yarn
curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add -
echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list
sudo apt update && sudo apt install yarn
```

3. **Clone your repository:**

```bash
git clone <your-github-repo-url> /opt/telegram-copperx-payout-bot
cd /opt/telegram-copperx-payout-bot
```

4. **Install dependencies and build:**

```bash
yarn install
yarn build
```

5. **Create a `.env` file:**

```bash
cat > .env << EOL
NODE_ENV=production
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
WEBHOOK_DOMAIN=your_webhook_domain
COPPERX_API_URL=https://income-api.copperx.io/api
PUSHER_APP_KEY=e089376087cac1a62785
PUSHER_APP_CLUSTER=ap1
EOL
```

6. **Set up a process manager (PM2):**

```bash
# Install PM2
sudo npm install -g pm2

# Start the application
pm2 start dist/main.js --name telegram-copperx-payout-bot

# Set up PM2 to start on boot
pm2 startup
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u $USER --hp $HOME
pm2 save
```

7. **Set up Nginx as a reverse proxy:**

```bash
# Install Nginx
sudo apt install -y nginx

# Configure Nginx
sudo cat > /etc/nginx/sites-available/telegram-copperx-payout-bot << EOL
server {
    listen 80;
    server_name your_domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOL

# Enable the site
sudo ln -s /etc/nginx/sites-available/telegram-copperx-payout-bot /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

8. **Set up SSL with Let's Encrypt:**

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d your_domain.com
```

9. **Set up the Telegram webhook:**

```bash
curl -X POST "https://api.telegram.org/bot<TELEGRAM_BOT_TOKEN>/setWebhook?url=https://your_domain.com/webhook"
```

## Continuous Integration/Continuous Deployment (CI/CD)

To automate the deployment process, you can set up CI/CD using GitHub Actions.

### GitHub Actions Workflow

Create a `.github/workflows/deploy.yml` file:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'yarn'

      - name: Install dependencies
        run: yarn install --frozen-lockfile

      - name: Run tests
        run: yarn test

      - name: Build
        run: yarn build

      - name: Deploy to Render
        env:
          RENDER_API_KEY: ${{ secrets.RENDER_API_KEY }}
        run: |
          curl -X POST \
            -H "Authorization: Bearer $RENDER_API_KEY" \
            -H "Content-Type: application/json" \
            https://api.render.com/v1/services/<YOUR_SERVICE_ID>/deploys
```

## Monitoring and Logging

### Render.com Monitoring

Render provides built-in logging and monitoring capabilities:

1. Navigate to your service in the Render dashboard
2. Go to the "Logs" tab to view application logs
3. Set up alerts for service downtime or errors

### Custom Monitoring

For more advanced monitoring, consider implementing:

1. **Sentry.io Integration:**

```typescript
// src/main.ts
import * as Sentry from '@sentry/node';

async function bootstrap() {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
  });

  // ... rest of bootstrap function
}
```

2. **Prometheus and Grafana:**

```typescript
// src/main.ts
import { NestFactory } from '@nestjs/core';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Register Prometheus metrics
  app.use(PrometheusModule.middleware);

  // ... rest of bootstrap function
}
```

## Backup Strategy

### Database Backups

If you're using a database to store session data:

1. **Automated Backups:**

   - Set up daily automated backups
   - Store backups in a secure location (e.g., AWS S3)

2. **Backup Rotation:**
   - Keep daily backups for a week
   - Keep weekly backups for a month
   - Keep monthly backups for a year

### Configuration Backups

1. **Environment Variables:**

   - Store environment variables securely (e.g., in a password manager)
   - Document all required environment variables

2. **Infrastructure as Code:**
   - Use tools like Terraform to manage infrastructure
   - Store infrastructure code in version control

## Scaling Considerations

### Horizontal Scaling

If the bot needs to handle a large number of users:

1. **Stateless Design:**

   - Ensure the application is stateless
   - Store session data in Redis or a similar distributed cache

2. **Load Balancing:**
   - Deploy multiple instances behind a load balancer
   - Use sticky sessions if necessary

### Vertical Scaling

For simpler deployments:

1. **Increase Resources:**
   - Upgrade to a higher tier on Render.com
   - Increase CPU and memory allocations

## Troubleshooting

### Common Issues

1. **Webhook Issues:**

   - Ensure your webhook URL is accessible from the internet
   - Verify SSL certificate is valid
   - Check Telegram webhook logs: `https://api.telegram.org/bot<TELEGRAM_BOT_TOKEN>/getWebhookInfo`

2. **API Connection Issues:**

   - Verify Copperx API credentials
   - Check network connectivity
   - Implement retry logic for API calls

3. **Performance Issues:**
   - Monitor memory usage
   - Implement caching for frequently accessed data
   - Optimize database queries

## Conclusion

This deployment guide provides comprehensive instructions for deploying the Copperx Telegram Payout Bot to various environments. By following these steps, you can ensure a smooth, reliable deployment with proper monitoring and scaling capabilities.
