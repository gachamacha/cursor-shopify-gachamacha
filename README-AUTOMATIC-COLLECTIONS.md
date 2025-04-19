# Automatic Game Collections

This document explains how to set up automatic collection creation for games when a product with a new game metafield is added to your Shopify store.

## Overview

When you add a new product with a Game metafield, the system will automatically create a collection for that game if one doesn't already exist. This eliminates the need to manually create collections for each new game.

## Requirements

To implement this feature, you need:

1. A serverless function deployment (e.g., Netlify Functions, Vercel Functions, AWS Lambda)
2. A Shopify private app with admin API access
3. Webhook configuration in your Shopify admin

## Setup Instructions

### 1. Create a Shopify Private App

1. Go to your Shopify admin
2. Navigate to Apps > Develop apps > Create an app
3. Name your app (e.g., "Automatic Collections Creator")
4. Set the required permissions:
   - `read_products`, `write_products`
   - `read_collections`, `write_collections`
5. Generate API credentials and note your API key and API secret key

### 2. Deploy the Serverless Function

1. Copy the code from `assets/auto-game-collections.js` to your serverless function
2. Set up the following environment variables in your serverless function environment:
   - `SHOPIFY_SHOP_DOMAIN` - Your Shopify store domain (e.g., `your-store.myshopify.com`)
   - `SHOPIFY_ACCESS_TOKEN` - The access token from your private app
   - `SHOPIFY_WEBHOOK_SECRET` - The webhook secret you'll use in the next step
   - `NODE_ENV` - Set to `production` for webhook verification
3. Deploy the function and note the endpoint URL (e.g., `https://your-site.netlify.app/.netlify/functions/auto-game-collections`)

### 3. Set Up Shopify Webhook

1. Go to your Shopify admin
2. Navigate to Settings > Notifications > Webhooks
3. Click "Add webhook"
4. Set the following:
   - Event: "Product creation" and "Product update"
   - Format: JSON
   - URL: Your serverless function endpoint
   - Secret: Use the same value you set for `SHOPIFY_WEBHOOK_SECRET` in step 2
5. Save the webhook

## Testing

To test if the automatic collection creation is working:

1. Add a new product with a Game metafield that doesn't already exist as a collection
2. Complete product creation
3. Check your Collections list - a new collection should be automatically created with the game name
4. The collection will automatically include all products with that Game metafield

## How It Works

The system works as follows:

1. When a product is created or updated, Shopify sends a webhook to your serverless function
2. The function checks if the product has a Game metafield
3. If a Game metafield exists, it checks if a collection for that game already exists
4. If no collection exists, it creates a new Smart Collection with rules to automatically include all products with that Game metafield

## Troubleshooting

If automatic collections aren't being created:

1. Check the logs of your serverless function for any errors
2. Verify that your webhook is correctly set up in Shopify
3. Ensure your private app has the correct permissions
4. Confirm that your environment variables are set correctly

## Need Help?

If you encounter any issues with this setup, please contact your developer for assistance. 