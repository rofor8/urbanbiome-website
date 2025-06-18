---
title: "Our Projects"
order: 9
navTitle: "Projects"
---
<div class="grid-3">
    <div class="project-item">
        <img src="https://placehold.co/400x250/9BB899/FFFFFF?text=Greenway+Revitalization" alt="Greenway Revitalization Project">
        <div class="project-content">
            <span class="placeholder-tag">Example Project</span>
            <h3>Greenway Revitalization</h3>
            <div class="status-location">
                <span>Completed</span>
                <span>City Center, Metropolis</span>
            </div>
            <p>Transforming an underutilized urban corridor into a vibrant greenway with native plants and community gardens.</p>
            <a href="#" class="btn btn-outline">View on Map</a>
        </div>
    </div>
    <div class="project-item">
        <img src="https://placehold.co/400x250/C1D8C1/FFFFFF?text=Rooftop+Farm" alt="Rooftop Permaculture Farm Project">
        <div class="project-content">
            <span class="placeholder-tag">Example Project</span>
            <h3>Rooftop Permaculture Farm</h3>
            <div class="status-location">
                <span>Ongoing</span>
                <span>North District, Gotham</span>
            </div>
            <p>Establishing a productive rooftop farm using permaculture principles to supply local produce and educate the community.</p>
            <a href="#" class="btn btn-outline">View on Map</a>
        </div>
    </div>
    <div class="project-item">
        <img src="https://placehold.co/400x250/7A9E88/FFFFFF?text=Wetland+Restoration" alt="Urban Wetland Restoration Project">
        <div class="project-content">
            <span class="placeholder-tag">Example Project</span>
            <h3>Urban Wetland Restoration</h3>
            <div class="status-location">
                <span>Ongoing</span>
                <span>Riverside, Star City</span>
            </div>
            <p>Restoring a degraded urban wetland to improve water quality, enhance biodiversity, and provide recreational space.</p>
            <a href="#" class="btn btn-outline">View on Map</a>
        </div>
    </div>
</div>

<style>
    /* Styles specific to projects.md */
    .project-item {
        background-color: var(--light-bg);
        border-radius: 8px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.08);
        border: 1px solid var(--border-color);
        overflow: hidden;
        text-align: left;
        display: flex;
        flex-direction: column;
    }

    .project-item img {
        width: 100%;
        height: 250px;
        object-fit: cover;
        display: block;
    }

    .project-content {
        padding: 25px;
        flex-grow: 1; /* Allows content to expand and push button to bottom */
        display: flex;
        flex-direction: column;
    }

    .project-content h3 {
        font-size: 1.6em;
        color: var(--heading-color);
        margin-bottom: 10px;
    }

    .project-content p {
        font-size: 0.95em;
        color: var(--text-color);
        margin-bottom: 15px;
    }

    .project-content .status-location {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 15px;
        font-size: 0.9em;
        color: var(--text-color);
    }

    .project-content .status-location span:first-child {
        font-weight: bold;
        color: var(--primary-accent);
    }

    .project-content .btn {
        display: block;
        width: calc(100% - 0px); /* Adjust for potential padding/margin on grid item */
        margin-top: auto; /* Push button to bottom */
    }

    .placeholder-tag {
        background-color: var(--placeholder-orange);
        color: #fff;
        padding: 4px 10px;
        border-radius: 5px;
        font-size: 0.8em;
        font-weight: bold;
        text-transform: uppercase;
        display: inline-block;
        margin-bottom: 12px;
    }
</style>