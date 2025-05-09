// This file serves as a template for a serverless function to create game collections automatically
// It should be deployed to a service like Netlify, Vercel, or AWS Lambda

// Import necessary libraries (uncomment when deploying to actual serverless environment)
// const axios = require('axios');
// const crypto = require('crypto');
// const fetch = require('node-fetch');

/**
 * Verify that the webhook request is coming from Shopify
 * 
 * @param {Object} req - The request object
 * @return {Boolean} - Whether the webhook is valid
 */
function verifyShopifyWebhook(req) {
  const hmacHeader = req.headers['x-shopify-hmac-sha256'];
  
  if (!hmacHeader) {
    throw new Error('Missing HMAC header');
  }
  
  const shopifySecret = process.env.SHOPIFY_WEBHOOK_SECRET;
  const hmac = crypto.createHmac('sha256', shopifySecret);
  const digest = hmac.update(req.body).digest('base64');
  
  if (digest !== hmacHeader) {
    throw new Error('Invalid HMAC signature');
  }
  
  return true;
}

/**
 * Serverless function to handle Shopify webhook for product creation/update
 * This function detects new game metafields and creates collections for them
 * 
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 */
exports.handler = async (req, res) => {
  try {
    // Verify Shopify webhook
    if (process.env.NODE_ENV === 'production') {
      verifyShopifyWebhook(req);
    }
    
    // Parse the webhook payload
    const product = JSON.parse(req.body);
    
    console.log(`Processing product: ${product.id} - ${product.title}`);
    
    // Check if the product has a game metafield
    if (!product.metafields || !product.metafields.find(m => m.namespace === 'custom' && m.key === 'game')) {
      console.log('No game metafield found for this product');
      return res.status(200).send('No game metafield found');
    }
    
    // Get the game value
    const gameMetafield = product.metafields.find(m => m.namespace === 'custom' && m.key === 'game');
    const gameName = gameMetafield.value;
    
    if (!gameName || gameName.trim() === '') {
      console.log('Empty game metafield value');
      return res.status(200).send('Empty game metafield value');
    }
    
    console.log(`Game metafield found: ${gameName}`);
    
    const gameHandle = gameName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-$/, '').replace(/^-/, '');
    
    // Check if a collection with this handle already exists
    const shopifyDomain = process.env.SHOPIFY_SHOP_DOMAIN;
    const shopifyAccessToken = process.env.SHOPIFY_ACCESS_TOKEN;
    
    if (!shopifyDomain || !shopifyAccessToken) {
      throw new Error('Missing Shopify API credentials');
    }
    
    // Use Shopify Admin API to check for existing collection
    console.log(`Checking if collection exists for handle: ${gameHandle}`);
    
    try {
      const collectionsResponse = await fetch(`https://${shopifyDomain}/admin/api/2023-07/collections.json?handle=${gameHandle}`, {
        method: 'GET',
        headers: {
          'X-Shopify-Access-Token': shopifyAccessToken,
          'Content-Type': 'application/json'
        }
      });
      
      if (!collectionsResponse.ok) {
        throw new Error(`Failed to check collections: ${collectionsResponse.statusText}`);
      }
      
      const collections = await collectionsResponse.json();
      
      // If collection doesn't exist, create it
      if (!collections.collections || collections.collections.length === 0) {
        console.log(`No collection found for ${gameHandle}, creating new one`);
        
        // Create smart collection using Shopify Admin API
        const createResponse = await fetch(`https://${shopifyDomain}/admin/api/2023-07/smart_collections.json`, {
          method: 'POST',
          headers: {
            'X-Shopify-Access-Token': shopifyAccessToken,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            smart_collection: {
              title: gameName,
              rules: [
                {
                  column: 'metafield',
                  relation: 'equals',
                  condition: gameName,
                  metafield: {
                    namespace: 'custom',
                    key: 'game'
                  }
                }
              ]
            }
          })
        });
        
        if (!createResponse.ok) {
          const errorData = await createResponse.json();
          throw new Error(`Failed to create collection: ${JSON.stringify(errorData)}`);
        }
        
        const createResult = await createResponse.json();
        console.log(`Successfully created collection: ${createResult.smart_collection.title} (ID: ${createResult.smart_collection.id})`);
        return res.status(200).send(`Created collection for game ${gameName}`);
      } else {
        console.log(`Collection already exists for game ${gameName}`);
        return res.status(200).send(`Collection for game ${gameName} already exists`);
      }
    } catch (apiError) {
      console.error('API Error:', apiError);
      throw new Error(`Shopify API error: ${apiError.message}`);
    }
  } catch (error) {
    console.error('Error processing webhook:', error);
    return res.status(500).send(`Error: ${error.message}`);
  }
}; 