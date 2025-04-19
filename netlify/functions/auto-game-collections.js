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
    
    try {
      // Check smart collections first
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
      
      // Process results
      const smartCollections = smartCollectionsResult.error ? { smart_collections: [] } : smartCollectionsResult.data;
      console.log(`Smart collections check result:`, JSON.stringify(smartCollections));
      
      const existingCollections = smartCollections.smart_collections || [];
      const collectionExists = existingCollections.length > 0;
      
      console.log(`Total existing collections found with handle '${gameHandle}': ${existingCollections.length}`);
      
      // If collection doesn't exist, create it
      if (!collectionExists) {
        console.log(`No collection found for ${gameHandle}, creating new one`);
        
        // Get the GraphQL Admin API endpoint
        const graphqlEndpoint = `https://${shopifyDomain}/admin/api/2023-07/graphql.json`;
        
        // This is the direct create smart collection with metafield condition approach
        // However, there's a limitation: Shopify's REST API doesn't support metafield conditions directly
        // We'll use a GraphQL mutation that can do this or fall back to using REST API with a different approach
        
        console.log(`Creating smart collection for game: ${gameName}`);
        
        // Construct query with proper indentation for readability in logs
        const query = `
          mutation {
            collectionCreate(input: {
              title: "${gameName}",
              ruleSet: {
                appliedDisjunctively: false,
                rules: [
                  {
                    column: "VARIANT_METAFIELD",
                    relation: "EQUALS",
                    condition: "${gameName}",
                    metafield: {
                      namespace: "custom",
                      key: "game"
                    }
                  }
                ]
              }
            }) {
              collection {
                id
                title
                handle
              }
              userErrors {
                field
                message
              }
            }
          }
        `;
        
        console.log(`GraphQL query: ${query}`);
        
        const graphqlResult = await shopifyApiRequest(
          graphqlEndpoint,
          {
            method: 'POST',
            headers: {
              'X-Shopify-Access-Token': shopifyAccessToken,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ query })
          },
          "GraphQL collection creation"
        );
        
        // Check for GraphQL errors
        if (graphqlResult.error || (graphqlResult.data && graphqlResult.data.errors)) {
          console.error("GraphQL errors:", graphqlResult.data?.errors || graphqlResult.message);
          console.log("Falling back to REST API approach...");
          
          // Fall back to creating a smart collection with REST API
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
                      column: "variant_metafield",
                      relation: "equals",
                      condition: gameName,
                      metafield: {
                        namespace: "custom",
                        key: "game"
                      }
                    }
                  ],
                  published: true
                }
              })
            },
            "Collection creation fallback"
          );
          
          if (createCollectionResult.error) {
            console.error("REST API fallback also failed. Creating a manual collection instead.");
            
            // As a last resort, create a regular collection and manually add the product
            const manualCollectionResult = await shopifyApiRequest(
              `https://${shopifyDomain}/admin/api/2023-07/custom_collections.json`,
              {
                method: 'POST',
                headers: {
                  'X-Shopify-Access-Token': shopifyAccessToken,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  custom_collection: {
                    title: gameName,
                    published: true
                  }
                })
              },
              "Manual collection creation"
            );
            
            if (manualCollectionResult.error) {
              throw new Error(`Failed to create any type of collection: ${manualCollectionResult.message}`);
            }
            
            const collectionId = manualCollectionResult.data.custom_collection.id;
            console.log(`Created manual collection: ${collectionId}`);
            
            // Add the product to the manually created collection
            const addProductResult = await shopifyApiRequest(
              `https://${shopifyDomain}/admin/api/2023-07/collects.json`,
              {
                method: 'POST',
                headers: {
                  'X-Shopify-Access-Token': shopifyAccessToken,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  collect: {
                    product_id: webhookData.id,
                    collection_id: collectionId
                  }
                })
              },
              "Add product to manual collection"
            );
            
            if (addProductResult.error) {
              console.error(`Warning: Failed to add product to collection: ${addProductResult.message}`);
            }
            
            return {
              statusCode: 200,
              body: `Created manual collection for ${gameName} as automatic collection creation failed`
            };
          } else {
            console.log(`Successfully created collection via REST API: ${createCollectionResult.data.smart_collection.title}`);
          }
        } else {
          // Check for user errors in the GraphQL response
          const userErrors = graphqlResult.data.data.collectionCreate.userErrors;
          if (userErrors && userErrors.length > 0) {
            console.error("GraphQL user errors:", JSON.stringify(userErrors));
            throw new Error(`Failed to create collection with GraphQL: ${userErrors[0].message}`);
          }
          
          console.log(`Successfully created collection via GraphQL: ${graphqlResult.data.data.collectionCreate.collection.title}`);
        }
        
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