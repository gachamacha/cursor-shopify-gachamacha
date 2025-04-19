// This file serves as a template for a serverless function to create game collections automatically
// It is deployed to Netlify Functions to automate collection creation

// Import necessary libraries
const crypto = require('crypto');
const fetch = require('node-fetch');

/**
 * Verify that the webhook request is coming from Shopify
 * 
 * @param {Object} req - The request object
 * @return {Boolean} - Whether the webhook is valid
 */
function verifyShopifyWebhook(req) {
  // For testing - remove this line when going to production
  console.log("Skipping verification for testing purposes");
  return true;
  
  /* Uncomment this code when your webhooks are working:
  const hmacHeader = req.headers['x-shopify-hmac-sha256'];
  
  if (!hmacHeader) {
    console.error('Missing HMAC header');
    return false;
  }
  
  const shopifySecret = process.env.SHOPIFY_API_SECRET_KEY;
  
  if (!shopifySecret) {
    console.warn('No API secret key configured, skipping verification');
    return true;
  }
  
  const hmac = crypto.createHmac('sha256', shopifySecret);
  const digest = hmac.update(req.body).digest('base64');
  
  console.log(`Calculated HMAC: ${digest}`);
  console.log(`Received HMAC: ${hmacHeader}`);
  
  if (digest !== hmacHeader) {
    console.error('Invalid HMAC signature');
    return false;
  }
  
  return true;
  */
}

/**
 * Netlify function to handle Shopify webhook for product creation/update
 * This function detects new game metafields and creates collections for them
 */
exports.handler = async (event, context) => {
  try {
    console.log("Received webhook - Headers:", JSON.stringify(event.headers));
    console.log("Received webhook - Body excerpt:", event.body.substring(0, 200) + "...");
    
    // Skip verification during testing
    const isVerified = verifyShopifyWebhook({
      headers: event.headers,
      body: event.body
    });
    
    if (!isVerified) {
      return {
        statusCode: 401,
        body: "Webhook verification failed"
      };
    }
    
    // Parse the webhook payload
    const product = JSON.parse(event.body);
    
    console.log(`Processing product: ${product.id} - ${product.title}`);
    
    // Log metafields to understand structure
    console.log("Metafields received:", JSON.stringify(product.metafields || []));
    
    // Check for metafields in different formats
    let gameMetafield = null;
    
    // Look for metafields in array format
    if (Array.isArray(product.metafields)) {
      console.log("Checking metafields array format");
      // Try namespace=custom, key=game
      gameMetafield = product.metafields.find(m => m.namespace === 'custom' && m.key === 'game');
      
      // If not found, try different common namespace/key combinations
      if (!gameMetafield) {
        gameMetafield = product.metafields.find(m => 
          (m.namespace === 'custom' && m.key === 'game') || 
          (m.key === 'custom.game') ||
          (m.namespace === 'global' && m.key === 'game')
        );
      }
    } 
    // Shopify sometimes nests metafields under a "metafields" property with namespace as keys
    else if (product.metafields && typeof product.metafields === 'object') {
      console.log("Checking metafields object format");
      
      // Check for custom.game format
      if (product.metafields.custom && product.metafields.custom.game) {
        gameMetafield = {
          namespace: 'custom',
          key: 'game',
          value: product.metafields.custom.game
        };
      }
    }
    
    // If still not found, check if there are any properties containing "game" for debugging
    if (!gameMetafield && product.metafields) {
      console.log("No standard game metafield found. Checking for any game-related fields for debugging");
      const allKeys = getAllMetafieldKeys(product.metafields);
      console.log("All available metafield keys:", allKeys);
    }
    
    // Exit if no game metafield found
    if (!gameMetafield) {
      console.log('No game metafield found for this product');
      return {
        statusCode: 200,
        body: 'No game metafield found'
      };
    }
    
    // Get the game value
    const gameName = typeof gameMetafield === 'object' ? gameMetafield.value : gameMetafield;
    
    if (!gameName || gameName.trim() === '') {
      console.log('Empty game metafield value');
      return {
        statusCode: 200,
        body: 'Empty game metafield value'
      };
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
        return {
          statusCode: 200,
          body: `Created collection for game ${gameName}`
        };
      } else {
        console.log(`Collection already exists for game ${gameName}`);
        return {
          statusCode: 200,
          body: `Collection for game ${gameName} already exists`
        };
      }
    } catch (apiError) {
      console.error('API Error:', apiError);
      throw new Error(`Shopify API error: ${apiError.message}`);
    }
  } catch (error) {
    console.error('Error processing webhook:', error);
    return {
      statusCode: 500,
      body: `Error: ${error.message}`
    };
  }
};

/**
 * Helper function to get all metafield keys recursively for debugging
 */
function getAllMetafieldKeys(obj, prefix = '') {
  if (!obj) return [];
  
  return Object.keys(obj).reduce((keys, key) => {
    const currentKey = prefix ? `${prefix}.${key}` : key;
    
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      return [...keys, currentKey, ...getAllMetafieldKeys(obj[key], currentKey)];
    }
    
    return [...keys, currentKey];
  }, []);
} 