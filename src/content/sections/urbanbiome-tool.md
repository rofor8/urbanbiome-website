---
title: "The UrbanBiome Tool"
order: 3
navTitle: "The Tool"
---
<div class="tool-overview">
    <img src="/images/tool.png" alt="A screenshot of the UrbanBiome tool interface, showing a map of 'The Dings' area with data layers for analysis and suggested interventions like 'Community Farms'." class="tool-image">
    <p style="font-style: italic; font-size: 0.9em; color: #666;">The UrbanBiome Tool in action.</p>
    <h3>Visualize, analyze, and plan for a greener city with our innovative platform.</h3>
    <a href="https://app.urbanbiome.co.uk" target="_blank" class="btn btn-outline">Explore the UrbanBiome Tool</a>
    <p style="font-size: 0.9em; color: #777; margin-top: 15px;">
        Please note: Access to the UrbanBiome Tool requires authentication. Please <a href="#contact">contact us</a> to request access.
    </p>
</div>

<hr style="border-color: var(--border-color); margin: 60px auto; max-width: 800px;">

<div class="section-header" style="margin-top: 80px;">
    <h3>Visualising the Challenge: A City's Greenspace</h3>
     <p style="max-width: 800px; margin: 20px auto 0;">This interactive map shows live Sentinel-2 satellite data, processed by Google Earth Engine to visualise the Normalised Difference Vegetation Index (NDVI). It is a powerful example of how we can identify areas that lack green space and target interventions where they are most needed.</p>
</div>

<div class="map-container">
    <iframe
        src="https://rofor8.users.earthengine.app/view/nvditimesliderbristol"
        style="border:none;"
        title="Bristol Recent NDVI">
    </iframe>
</div>


<div class="tool-links">
    <div class="tool-link-item">
        <h4>Open Data</h4>
        <p>Access the datasets powering UrbanBiome. Detailed information about available datasets, data standards, and licensing.</p>
        <a href="#">Download Raw Data (Placeholder)</a>
    </div>
    <div class="tool-link-item">
        <h4>API Access</h4>
        <p>Integrate UrbanBiome data programmatically. Developer documentation for API endpoints, authentication, and rate limits.</p>
        <a href="#">View API Docs (Placeholder)</a>
    </div>
</div>

<style>
    /* Styles specific to urbanbiome-tool.md which might not be global */
    /* If you modify global.css, you might not need this style block here */
    .tool-overview {
        display: flex;
        flex-direction: column;
        align-items: center;
        margin-bottom: 60px;
    }

    .tool-image {
        width: 100%;
        max-width: 900px;
        height: auto;
        border-radius: 8px;
        box-shadow: 0 8px 25px rgba(0,0,0,0.1);
        margin-bottom: 30px;
    }

    .tool-features {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: 30px;
        margin-top: 50px;
    }

    .tool-feature-item {
        background-color: var(--background-color);
        padding: 25px;
        border-left: 5px solid var(--primary-accent);
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.05);
    }

    .tool-links {
        margin-top: 50px;
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 30px;
        text-align: center;
    }

    .tool-link-item {
        padding: 25px;
        background-color: var(--light-bg);
        border-radius: 8px;
        border: 1px solid var(--border-color);
        transition: all 0.3s ease;
    }

    .tool-link-item:hover {
        box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        transform: translateY(-5px);
    }

    .tool-link-item a {
        font-weight: bold;
        display: block;
        margin-top: 15px;
    }

    .map-container {
        position: relative;
        overflow: hidden;
        width: 100%;
        padding-top: 75%; /* 4:3 Aspect Ratio */
        margin-top: 40px;
    }

    .map-container iframe {
        position: absolute;
        top: 0;
        left: 0;
        bottom: 0;
        right: 0;
        width: 100%;
        height: 100%;
        border: 1px solid var(--border-color);
        border-radius: 8px;
    }
</style>