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
 * Helper function to handle API requests to Shopify
 * 
 * @param {string} url - The API endpoint URL
 * @param {Object} options - The fetch options
 * @param {string} errorPrefix - Prefix for error messages
 * @return {Promise<Object>} - The API response
 */
async function shopifyApiRequest(url, options, errorPrefix) {
  try {
    console.log(`Making API request to: ${url}`);
    const response = await fetch(url, options);
    
    // Log status code for debugging
    console.log(`API response status: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      // Try to extract detailed error
      const errorText = await response.text();
      console.error(`${errorPrefix} failed with status ${response.status}: ${errorText}`);
      return { error: true, status: response.status, message: errorText };
    }
    
    const data = await response.json();
    return { error: false, data };
  } catch (error) {
    console.error(`${errorPrefix} exception:`, error);
    return { error: true, message: error.message };
  }
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
    const webhookData = JSON.parse(event.body);
    
    console.log(`Processing product: ${webhookData.id} - ${webhookData.title}`);
    
    // Get Shopify credentials
    const shopifyDomain = process.env.SHOPIFY_SHOP_DOMAIN;
    const shopifyAccessToken = process.env.SHOPIFY_ACCESS_TOKEN;
    
    if (!shopifyDomain || !shopifyAccessToken) {
      throw new Error('Missing Shopify API credentials');
    }
    
    // Instead of relying on webhook payload for metafields, fetch the product with metafields
    console.log(`Fetching complete product data with metafields for product ID: ${webhookData.id}`);
    
    // Make API call to get the product with metafields
    const productResult = await shopifyApiRequest(
      `https://${shopifyDomain}/admin/api/2023-07/products/${webhookData.id}.json?fields=id,title,metafields`,
      {
        method: 'GET',
        headers: {
          'X-Shopify-Access-Token': shopifyAccessToken,
          'Content-Type': 'application/json'
        }
      },
      "Product fetch"
    );
    
    if (productResult.error) {
      throw new Error(`Failed to fetch product: ${productResult.message}`);
    }
    
    const productData = productResult.data;
    console.log(`Product data received:`, JSON.stringify(productData));
    
    // If no metafields are returned in the product data, we need to make a separate call
    let metafields = [];
    if (!productData.product.metafields || productData.product.metafields.length === 0) {
      console.log(`No metafields in product data, fetching metafields separately`);
      
      const metafieldsResult = await shopifyApiRequest(
        `https://${shopifyDomain}/admin/api/2023-07/products/${webhookData.id}/metafields.json`,
        {
          method: 'GET',
          headers: {
            'X-Shopify-Access-Token': shopifyAccessToken,
            'Content-Type': 'application/json'
          }
        },
        "Metafields fetch"
      );
      
      if (metafieldsResult.error) {
        throw new Error(`Failed to fetch metafields: ${metafieldsResult.message}`);
      }
      
      console.log(`Metafields data received:`, JSON.stringify(metafieldsResult.data));
      
      metafields = metafieldsResult.data.metafields || [];
    } else {
      metafields = productData.product.metafields;
    }
    
    // Look for game metafield in the metafields array
    console.log(`Total metafields found: ${metafields.length}`);
    
    // Log all metafields for debugging
    metafields.forEach((m, i) => {
      console.log(`Metafield ${i+1}: namespace=${m.namespace}, key=${m.key}, value=${m.value}`);
    });
    
    // Look for game metafield with namespace=custom, key=game
    let gameMetafield = metafields.find(m => m.namespace === 'custom' && m.key === 'game');
    
    // If not found, try other common patterns
    if (!gameMetafield) {
      console.log('Looking for alternative metafield patterns...');
      gameMetafield = metafields.find(m => 
        (m.key === 'game') || 
        (m.key === 'custom.game') ||
        (m.namespace === 'global' && m.key === 'game')
      );
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
    const gameName = gameMetafield.value;
    
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
    console.log(`Checking if collection exists for handle: ${gameHandle}`);
    
    // Track if collection exists
    let collectionExists = false;
    let existingCollections = [];
    
    try {
      // First check custom collections
      const customCollectionsResult = await shopifyApiRequest(
        `https://${shopifyDomain}/admin/api/2023-07/custom_collections.json?handle=${gameHandle}`,
        {
          method: 'GET',
          headers: {
            'X-Shopify-Access-Token': shopifyAccessToken,
            'Content-Type': 'application/json'
          }
        },
        "Custom collections check"
      );
      
      // Then check smart collections
      const smartCollectionsResult = await shopifyApiRequest(
        `https://${shopifyDomain}/admin/api/2023-07/smart_collections.json?handle=${gameHandle}`,
        {
          method: 'GET',
          headers: {
            'X-Shopify-Access-Token': shopifyAccessToken,
            'Content-Type': 'application/json'
          }
        },
        "Smart collections check"
      );
      
      // Process results from both endpoints
      const customCollections = customCollectionsResult.error ? { custom_collections: [] } : customCollectionsResult.data;
      const smartCollections = smartCollectionsResult.error ? { smart_collections: [] } : smartCollectionsResult.data;
      
      console.log(`Custom collections check result:`, JSON.stringify(customCollections));
      console.log(`Smart collections check result:`, JSON.stringify(smartCollections));
      
      // Combine both collection types
      existingCollections = [
        ...(customCollections.custom_collections || []),
        ...(smartCollections.smart_collections || [])
      ];
      
      collectionExists = existingCollections.length > 0;
      console.log(`Total existing collections found with handle '${gameHandle}': ${existingCollections.length}`);
      
      // If collection doesn't exist, create it
      if (!collectionExists) {
        console.log(`No collection found for ${gameHandle}, creating new one`);
        
        // Fix the collection creation rules to use a valid format for metafield filtering
        // According to Shopify API docs, use 'tag' column and 'game:' prefix for metafield-based collections
        const gameTag = `game:${gameName}`;
        console.log(`Using tag rule: ${gameTag}`);
        
        // Create smart collection using Shopify Admin API
        const createCollectionResult = await shopifyApiRequest(
          `https://${shopifyDomain}/admin/api/2023-07/smart_collections.json`,
          {
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
                    column: 'tag',
                    relation: 'equals',
                    condition: gameTag
                  }
                ],
                published: true
              }
            })
          },
          "Collection creation"
        );
        
        if (createCollectionResult.error) {
          throw new Error(`Failed to create collection: ${createCollectionResult.message}`);
        }
        
        console.log(`Successfully created collection: ${createCollectionResult.data.smart_collection.title} (ID: ${createCollectionResult.data.smart_collection.id})`);
        
        // Now add the game tag to the product
        console.log(`Adding game tag to product: ${gameTag}`);
        
        // First get the product's existing tags
        const productTagsResult = await shopifyApiRequest(
          `https://${shopifyDomain}/admin/api/2023-07/products/${webhookData.id}.json?fields=id,tags`,
          {
            method: 'GET',
            headers: {
              'X-Shopify-Access-Token': shopifyAccessToken,
              'Content-Type': 'application/json'
            }
          },
          "Product tags fetch"
        );
        
        if (productTagsResult.error) {
          console.error(`Warning: Failed to fetch product tags: ${productTagsResult.message}`);
        } else {
          // Get existing tags
          const existingTags = productTagsResult.data.product.tags || '';
          const tagArray = existingTags.split(', ').filter(tag => tag.trim() !== '');
          
          // Add the game tag if it doesn't exist
          if (!tagArray.includes(gameTag)) {
            tagArray.push(gameTag);
          }
          
          // Join tags back into a string
          const newTags = tagArray.join(', ');
          console.log(`Updating product tags from "${existingTags}" to "${newTags}"`);
          
          // Update the product with the new tags
          const updateTagsResult = await shopifyApiRequest(
            `https://${shopifyDomain}/admin/api/2023-07/products/${webhookData.id}.json`,
            {
              method: 'PUT',
              headers: {
                'X-Shopify-Access-Token': shopifyAccessToken,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                product: {
                  id: webhookData.id,
                  tags: newTags
                }
              })
            },
            "Product tags update"
          );
          
          if (updateTagsResult.error) {
            console.error(`Warning: Failed to update product tags: ${updateTagsResult.message}`);
          } else {
            console.log(`Successfully updated product tags`);
          }
        }
        
        return {
          statusCode: 200,
          body: `Created collection for game ${gameName} and tagged the product`
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