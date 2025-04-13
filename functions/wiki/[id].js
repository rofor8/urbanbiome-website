// File: functions/wiki/[id].js
// Server-side renders the wiki page for a specific intervention.

// Helper function to safely escape HTML (prevent XSS)
const escapeHTML = str => str ? str.replace(/[&<>\'\"/]/g, tag => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
    '/': '&#x2F;'
}[tag])) : '';

// --- START: CSS & JS to Inject --- 
const productCardStyles = `
<style>
    #products-list {
        list-style: none; /* Remove bullet points */
        padding-left: 0; /* Remove default padding */
    }
    .product-card {
        border: 1px solid #ddd;
        padding: 15px;
        margin-bottom: 15px;
        border-radius: 8px;
        background-color: #f8f9fa;
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        align-items: center;
    }
    .product-card .info {
        flex-basis: calc(70% - 20px); /* Adjust basis */
        margin-right: 20px;
    }
    .product-card .info h4 {
        margin: 0 0 5px 0;
        font-size: 1.1rem;
        color: #2a2f4a;
    }
    .product-card .info p {
        font-size: 0.9rem;
        color: #555;
        margin: 0 0 8px 0;
        line-height: 1.4;
    }
    .product-card .actions {
        flex-basis: 30%;
        text-align: right;
    }
    .product-card .price {
        font-weight: bold;
        font-size: 1.1rem;
        margin-bottom: 10px;
        display: block;
        color: #333;
    }
    .product-card .add-btn {
        padding: 8px 12px;
        background-color: #28a745;
        color: white;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        font-size: 0.9rem;
        transition: background-color 0.2s ease;
    }
    .product-card .add-btn:hover {
        background-color: #218838;
    }
    #add-all-btn {
         display: none; /* Hidden by default, shown via JS if products exist */
         padding: 10px 18px;
         background-color: #007bff;
         color: white;
         border: none;
         border-radius: 5px;
         cursor: pointer;
         font-size: 1rem;
         font-weight: 500;
         transition: background-color 0.2s ease;
         margin-bottom: 20px; /* Space below button */
    }
    #add-all-btn:hover {
         background-color: #0056b3;
    }
    .cart-feedback { /* Style for add-to-cart confirmation */
        font-size: 0.9em;
        color: green;
        margin-left: 10px;
        display: none; /* Hidden by default */
        font-style: italic;
    }
    /* Responsive adjustments */
    @media (max-width: 768px) {
        .product-card .info {
            flex-basis: 100%;
            margin-right: 0;
            margin-bottom: 10px;
        }
        .product-card .actions {
            flex-basis: 100%;
            text-align: left; /* Align actions left on small screens */
        }
         .product-card .price {
             display: inline-block;
             margin-right: 15px;
             margin-bottom: 0;
         }
    }
</style>
`;

const cartScript = `
<script>
    // --- START: Cart Logic (Client-Side) ---
    let cart = JSON.parse(localStorage.getItem('urbanBiomeCart')) || {};
    let cachedCatalog = null; // Cache for product details

    // Helper to fetch catalog if needed (mainly for 'Add All')
    async function fetchShopCatalog() {
        if (cachedCatalog) {
            return cachedCatalog;
        }
        try {
            const response = await fetch('/api/products'); // Assumes this API exists
            if (!response.ok) {
                throw new Error('Failed to fetch product catalog');
            }
            cachedCatalog = await response.json();
            return cachedCatalog;
        } catch (error) {
            console.error("Error fetching product catalog:", error);
            return []; // Return empty array on error
        }
    }

    function addToCart(productId, productName, productPrice) {
        const price = parseFloat(productPrice);
        if (isNaN(price)) {
            console.error("Invalid price for product:", productId);
            return;
        }

        if (cart[productId]) {
            cart[productId].quantity += 1;
        } else {
            cart[productId] = { name: productName, quantity: 1, price: price };
        }
        localStorage.setItem('urbanBiomeCart', JSON.stringify(cart));
        console.log("Cart updated:", cart); // Log for debugging

        // Show feedback
        const button = document.querySelector(`.add-btn[data-product-id="${productId}"]`);
        if (button) {
             const feedback = button.nextElementSibling;
             if (feedback && feedback.classList.contains('cart-feedback')) {
                 feedback.style.display = 'inline';
                 setTimeout(() => { feedback.style.display = 'none'; }, 2000); // Hide after 2s
             }
        }
    }

    document.addEventListener('DOMContentLoaded', () => {
        const productListElement = document.getElementById('products-list');
        const addAllButton = document.getElementById('add-all-btn');

        if (productListElement) {
            // Event listener for individual add buttons (using delegation)
            productListElement.addEventListener('click', (event) => {
                if (event.target.classList.contains('add-btn')) {
                    const button = event.target;
                    addToCart(
                        button.dataset.productId,
                        button.dataset.productName,
                        button.dataset.productPrice
                    );
                }
            });

            // Show 'Add All' button if products exist
            if (addAllButton && productListElement.children.length > 0) {
                addAllButton.style.display = 'inline-block';
            }
        }

        // Event listener for the 'Add All' button
        if (addAllButton) {
            addAllButton.addEventListener('click', async () => {
                console.log("Add All clicked");
                const productCards = document.querySelectorAll('#products-list .product-card .add-btn');

                if (!productCards || productCards.length === 0) {
                    console.warn("No product buttons found for Add All");
                    return;
                }

                let itemsAddedCount = 0;
                productCards.forEach(button => {
                     try {
                        addToCart(
                            button.dataset.productId,
                            button.dataset.productName,
                            button.dataset.productPrice
                        );
                        itemsAddedCount++;
                     } catch (err) {
                         console.warn(`Could not add product ${button.dataset.productId} during Add All:`, err);
                     }
                });

                if (itemsAddedCount > 0) {
                     alert(`${itemsAddedCount} item(s) added to your cart.`);
                     // Note: Individual feedback isn't triggered here, could be added if needed.
                }
            });
        }
    });
    // --- END: Cart Logic --- 
</script>
`;

// --- END: CSS & JS to Inject ---

export async function onRequest(context) {
    const { request, env, params } = context;
    const interventionId = params.id;

    // --- 1. Validate Environment Bindings --- 
    if (!env.INTERVENTION_DATA_KV) {
        console.error("KV namespace binding 'INTERVENTION_DATA_KV' not found.");
        return new Response("Server configuration error.", { status: 500 });
    }
    if (!env.ASSETS) {
        console.error("ASSETS binding is missing.");
        return new Response("Server configuration error.", { status: 500 });
    }

    // --- 2. Fetch Intervention Data from KV --- 
    let interventionData;
    try {
        interventionData = await env.INTERVENTION_DATA_KV.get(interventionId, { type: "json" });
        if (!interventionData) {
            return new Response(`Intervention data not found for ID: ${interventionId}`, { status: 404 });
        }
    } catch (error) {
        console.error(`Error fetching data for ID ${interventionId} from KV:`, error);
        return new Response("Failed to retrieve intervention data.", { status: 500 });
    }

    // --- 3. Fetch HTML Template --- 
    let htmlTemplate;
    try {
        const assetUrl = new URL("/wiki/index.html", request.url);
        const assetResponse = await env.ASSETS.fetch(assetUrl);
        if (!assetResponse.ok) {
             throw new Error(`Failed to fetch template: ${assetResponse.status} ${assetResponse.statusText}`);
        }
        htmlTemplate = await assetResponse.text();

        // DEBUG: Log the beginning of the fetched template
        console.log("Fetched template start:", htmlTemplate.substring(0, 200)); 

    } catch (error) {
        console.error("Error fetching HTML template /wiki/index.html:", error);
        return new Response("Failed to load page template.", { status: 500 });
    }

    // --- 4. Prepare Data & Render HTML Sections --- 
    const pageTitle = `${interventionData.name || 'Wiki Entry'} - Urban Biome Wiki`;
    const sourcesFormatted = interventionData.sources ? `(Sources: ${escapeHTML(interventionData.sources)})` : '';

    let benefitsHtml = '';
    if (interventionData.benefits && interventionData.benefits.length > 0) {
        const benefitsItems = interventionData.benefits.map(benefit =>
            `<li><strong>${escapeHTML(benefit.category)}:</strong> ${escapeHTML(benefit.text)}</li>`
        ).join('');
        benefitsHtml = `<div id="benefits-section">
                         <h3>Key Benefits</h3>
                         <ul id="benefits-list" class="benefits-list">${benefitsItems}</ul>
                      </div>`;
    }

    let guidanceHtml = '';
    if (interventionData.technicalGuidance && interventionData.technicalGuidance.length > 0) {
        const guidanceItems = interventionData.technicalGuidance.map(section => `
            <div class="guidance-section">
                <h4>${escapeHTML(section.heading)}</h4>
                ${section.content.map(p => `<p>${escapeHTML(p)}</p>`).join('')}
            </div>
        `).join('');
         guidanceHtml = `<div id="guidance-section">
                         <h3>Technical Guidance</h3>
                         <div id="guidance-content">${guidanceItems}</div>
                       </div>`;
    }

    // Products section requires fetching catalog - potential enhancement: fetch in parallel or cache
    let productsHtml = '';
    if (interventionData.productsNeeded && interventionData.productsNeeded.length > 0) {
        let productCatalog = [];
        try {
            // Attempt to fetch product catalog from API route (ensure it exists and is accessible)
            const catalogResponse = await fetch(new URL('/api/products', request.url).toString()); 
            if (catalogResponse.ok) {
                productCatalog = await catalogResponse.json();
            } else {
                console.warn(`Failed to fetch product catalog: ${catalogResponse.status}`);
            }
        } catch (catalogError) {
             console.error("Error fetching product catalog within wiki function:", catalogError);
        }
        
        const productItems = interventionData.productsNeeded.map(productId => {
             const product = productCatalog.find(p => p.id === productId);
             if (!product) {
                 // Log error or return placeholder if product not found
                 console.warn(`Product ID ${productId} mentioned in intervention ${interventionId} not found in catalog.`);
                 return `<li class="product-card">Product ID ${escapeHTML(productId)} not found.</li>`; 
             }
             const productName = product.name;
             const productPrice = product.price;
             const productDescription = product.description || '';
             const truncatedDescription = productDescription.length > 100 ? escapeHTML(productDescription.substring(0, 100)) + '...' : escapeHTML(productDescription);

             // Create product card HTML
             return `
                 <li class="product-card" data-product-id="${escapeHTML(productId)}">
                     <div class="info">
                         <h4>${escapeHTML(productName)}</h4>
                         <p>${truncatedDescription}</p>
                     </div>
                     <div class="actions">
                         <span class="price">£${typeof productPrice === 'number' ? productPrice.toFixed(2) : 'N/A'}</span>
                         <button class="add-btn"
                                 data-product-id="${escapeHTML(productId)}"
                                 data-product-name="${escapeHTML(productName)}"
                                 data-product-price="${escapeHTML(String(productPrice))}">Add to Cart</button>
                         <span class="cart-feedback">Added!</span>
                     </div>
                 </li>
             `;
        }).join('\n');

        // Add the 'Add All' button before the list
        const addAllBtnHtml = `<button id="add-all-btn">Add All Items to Cart</button>`;

        productsHtml = `<div id="products-section">
                         <h3>Products Needed</h3>
                         ${addAllBtnHtml}
                         <ul id="products-list" class="products-list">${productItems}</ul>
                      </div>`;
    }

    let readingHtml = '';
    if (interventionData.furtherReading && interventionData.furtherReading.length > 0) {
        const readingItems = interventionData.furtherReading.map(link =>
            `<li><a href="${escapeHTML(link.url)}" target="_blank" rel="noopener noreferrer">${escapeHTML(link.title)}</a></li>`
        ).join('');
        readingHtml = `<div id="reading-section">
                         <h3>Further Reading</h3>
                         <ul id="reading-list" class="further-reading">${readingItems}</ul>
                       </div>`;
    }

    // --- 5. Replace Placeholders in Template --- 
    let finalHtml = htmlTemplate;
    finalHtml = finalHtml.replace('{{page_title}}', escapeHTML(pageTitle));
    finalHtml = finalHtml.replace('{{intervention.name}}', escapeHTML(interventionData.name || 'N/A'));
    finalHtml = finalHtml.replace('{{intervention.sources_formatted}}', sourcesFormatted); // Already escaped
    finalHtml = finalHtml.replace('{{benefits_section_html}}', benefitsHtml); // HTML built with escaped content
    finalHtml = finalHtml.replace('{{guidance_section_html}}', guidanceHtml); // HTML built with escaped content
    finalHtml = finalHtml.replace('{{products_section_html}}', productsHtml); // HTML built with escaped content
    finalHtml = finalHtml.replace('{{reading_section_html}}', readingHtml); // HTML built with escaped content

    // --- Inject CSS and JS --- 
    finalHtml = finalHtml.replace('</head>', productCardStyles + '</head>');
    finalHtml = finalHtml.replace('</body>', cartScript + '</body>');

    // --- 6. Return Rendered HTML --- 
    return new Response(finalHtml, {
        headers: { 'Content-Type': 'text/html;charset=UTF-8' },
    });
} 