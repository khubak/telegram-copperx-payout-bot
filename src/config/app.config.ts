export const appConfig = () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  copperxApi: {
    baseUrl: process.env.COPPERX_API_URL || 'https://income-api.copperx.io/api',
  },
  pusher: {
    appKey: process.env.PUSHER_APP_KEY || 'e089376087cac1a62785',
    cluster: process.env.PUSHER_APP_CLUSTER || 'ap1',
  },
  telegram: {
    token: process.env.TELEGRAM_BOT_TOKEN,
    webhookDomain: process.env.WEBHOOK_DOMAIN,
  },
});
