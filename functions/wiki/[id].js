// File: functions/wiki/[id].js
// Server-side renders the wiki page for a specific intervention.

// Helper function to safely escape HTML (prevent XSS)
const escapeHTML = str => str.replace(/[&<>'"/]/g, tag => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
    '/': '&#x2F;'
}[tag]));

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
             const productName = product ? product.name : productId;
             return `<li><a href="/shop/?product_id=${encodeURIComponent(productId)}">${escapeHTML(productName)}</a></li>`;
        }).join('');

        productsHtml = `<div id="products-section">
                         <h3>Products Needed</h3>
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

    // --- 6. Return Rendered HTML --- 
    return new Response(finalHtml, {
        headers: { 'Content-Type': 'text/html;charset=UTF-8' },
    });
} 