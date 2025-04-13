// File: functions/wiki/index.js
// Server-side renders the main wiki index page, listing all interventions.

// Helper function to safely escape HTML (prevent XSS)
const escapeHTML = str => String(str).replace(/[&<>'\"/]/g, tag => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
    '/': '&#x2F;'
}[tag] || tag)); // Ensure string conversion and handle potential undefined tags

export async function onRequest(context) {
    const { request, env } = context;

    // --- 1. Validate Environment Bindings ---
    if (!env.INTERVENTION_DATA_KV) {
        console.error("KV namespace binding 'INTERVENTION_DATA_KV' not found.");
        return new Response("Server configuration error: KV binding missing.", { status: 500 });
    }
     // We don't necessarily need ASSETS binding here if we construct HTML directly
     // Add back if fetching a base template becomes necessary later

    // --- 2. List and Fetch Intervention Data from KV ---
    let interventionListHtml = '';
    let interventions = [];
    try {
        const listResult = await env.INTERVENTION_DATA_KV.list();
        if (!listResult || !listResult.keys) {
             throw new Error("Failed to list keys from KV.");
        }

        const fetchPromises = listResult.keys.map(async (key) => {
            try {
                const interventionData = await env.INTERVENTION_DATA_KV.get(key.name, { type: "json" });
                // Basic validation: Ensure it's an object with at least an id and name
                if (interventionData && typeof interventionData === 'object' && interventionData.id && interventionData.name) {
                     // Add summary if available, default to empty string
                    interventionData.summary = interventionData.summary || '';
                    return interventionData;
                } else {
                    console.warn(`Invalid or incomplete data format for KV key: ${key.name}`);
                    return null; // Skip invalid entries
                }
            } catch (error) {
                 console.error(`Error fetching or parsing data for key ${key.name} from KV:`, error);
                 return null; // Skip entries that cause errors
            }
        });

        const results = await Promise.all(fetchPromises);
        interventions = results.filter(data => data !== null); // Filter out nulls (errors/invalid)

        // Sort interventions alphabetically by name
        interventions.sort((a, b) => a.name.localeCompare(b.name));

        // --- 3. Generate HTML for the List ---
        if (interventions.length > 0) {
             interventionListHtml = interventions.map(intervention => `
                <div class="wiki-item">
                    <div class="item-info">
                        <h4 class="intervention-name">${escapeHTML(intervention.name)}</h4>
                        <p class="intervention-summary">${escapeHTML(intervention.summary)}</p>
                    </div>
                    <div class="item-actions">
                         <a href="/wiki/${encodeURIComponent(intervention.id)}" class="view-details-btn">View Details</a>
                    </div>
                </div>
            `).join('');
        } else {
            interventionListHtml = '<p>No wiki interventions found.</p>';
        }

    } catch (error) {
        console.error("Error listing or processing interventions from KV:", error);
        interventionListHtml = '<p>Error loading wiki index. Please try again later.</p>';
        // Optionally return a 500 status, but showing an error message might be better UX
        // return new Response("Failed to retrieve intervention list.", { status: 500 });
    }

    // --- 4. Construct the Full HTML Page ---
    const pageTitle = "Wiki Index - Urban Biome";
    const finalHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHTML(pageTitle)}</title>
    <link rel="stylesheet" href="/styles.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet">
    <style>
        /* Styles adapted from shop/index.html */
        main section {
            max-width: 1200px;
            margin: 8rem auto 2rem auto; /* Add top margin like shop */
            padding: 0 20px;
        }
        .wiki-index-container h2 {
             margin-bottom: 1.5rem; /* Space below title */
        }
        .wiki-list {
            /* Could use grid like shop if preferred */
            display: flex;
            flex-direction: column;
            gap: 20px; /* Space between items */
             min-height: 100px; /* Prevent collapse while loading maybe? */
        }
        .wiki-item {
            border: 1px solid #ddd;
            padding: 20px;
            border-radius: 8px;
            background-color: #fff;
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            flex-wrap: wrap;
            transition: box-shadow 0.2s ease-in-out;
        }
        .wiki-item:hover {
            box-shadow: 0 4px 8px rgba(0,0,0,0.05);
        }
        .wiki-item .item-info {
            flex-basis: calc(100% - 150px); /* Adjust based on button width */
            padding-right: 20px;
             flex-grow: 1;
        }
        .wiki-item h4 {
            margin-top: 0;
            margin-bottom: 10px;
            font-size: 1.2rem;
            color: #2a2f4a;
        }
        .wiki-item p {
            margin-bottom: 8px;
            color: #555;
            font-size: 0.95rem;
            line-height: 1.5;
        }
        .wiki-item .item-actions {
            flex-basis: 120px; /* Fixed width for button area */
            text-align: right;
            margin-top: 5px; /* Align button nicely */
            flex-shrink: 0;
        }
        .view-details-btn {
            display: inline-block; /* Correct display */
            padding: 9px 15px;
            background-color: #007bff; /* Blue like shop checkout */
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 0.9rem;
            font-weight: 500;
            text-decoration: none; /* Remove underline from link */
            text-align: center;
            transition: background-color 0.2s ease;
        }
        .view-details-btn:hover {
            background-color: #0056b3;
            color: white; /* Ensure text remains white */
        }
        /* Responsive adjustments */
        @media (max-width: 768px) {
             .wiki-item {
                 flex-direction: column;
             }
             .wiki-item .item-info {
                flex-basis: 100%;
                padding-right: 0;
                margin-bottom: 15px; /* Space before button on mobile */
             }
             .wiki-item .item-actions {
                 flex-basis: 100%;
                 text-align: left; /* Align button left on mobile */
             }
        }
    </style>
</head>
<body>
    <header>
        <nav>
            <div class="logo">URBAN BIOME</div>
            <div class="nav-links">
                <a href="/#about">About</a>
                <a href="/#what-we-do">What We Do</a>
                <a href="/wiki/">Wiki</a>
                <a href="/shop/">Shop</a>
                <a href="/installers/">Find Installers</a>
                <a href="/#get-involved">Get Involved</a>
                <a href="https://urbanbiome.app" class="cta-button">Launch App</a>
            </div>
        </nav>
    </header>

    <main>
        <section class="wiki-index-container">
             <h2>Wiki Interventions</h2>
             <p>Browse the available urban greening and sustainability interventions.</p>
             <div class="wiki-list">
                 ${interventionListHtml}
             </div>
        </section>
    </main>

    <footer>
        <div class="footer-content">
            <div class="footer-section">
                <h4>Urban Biome</h4>
                <p>Smart urban planning for sustainable cities</p>
            </div>
            <div class="footer-section">
                <h4>Quick Links</h4>
                <a href="/#about">About</a>
                <a href="/#what-we-do">What We Do</a>
                <a href="/wiki/">Wiki</a>
                <a href="/shop/">Shop</a>
                <a href="/installers/">Find Installers</a>
                <a href="/#get-involved">Get Involved</a>
            </div>
            <div class="footer-section">
                <h4>Contact</h4>
                <a href="mailto:reuben@urbanbiome.info">reuben@urbanbiome.info</a>
            </div>
        </div>
        <div class="footer-bottom">
            <p>&copy; 2024 Urban Biome. All rights reserved.</p>
        </div>
    </footer>
</body>
</html>`;

    // --- 5. Return Rendered HTML ---
    return new Response(finalHtml, {
        headers: { 'Content-Type': 'text/html;charset=UTF-8' },
    });
} 