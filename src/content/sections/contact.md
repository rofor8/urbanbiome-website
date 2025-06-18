---
title: "Get In Touch"
order: 13
---
<div class="contact-info">
    <div class="contact-item">
        <h4>Email</h4>
        <p><a href="mailto:reuben@urbanbiome.info">reuben@urbanbiome.info</a></p>
        <p><a href="mailto:mannon@urbanbiome.info">mannon@urbanbiome.info</a></p>
    </div>
    <div class="contact-item">
        <h4>Website</h4>
        <p><a href="http://urbanbiome.co.uk" target="_blank">urbanbiome.co.uk</a></p>
    </div>
    <div class="contact-item">
        <h4>Office Hours</h4>
        <p>Monday - Friday: 9:00 AM - 5:00 PM</p>
        <p>Saturday - Sunday: Closed</p>
    </div>
</div>

<div class="contact-form-container">
    <h3>Send us a Message</h3>
    <p>Fill out the form below and we'll respond as soon as possible.</p>
    <form action="https://formspree.io/f/xldnljgb" method="POST">
        <label for="fullName">Full Name</label>
        <input type="text" id="fullName" name="name" placeholder="Your Name" required>

        <label for="emailAddress">Email Address</label>
        <input type="email" id="emailAddress" name="_replyto" placeholder="your.email@example.com" required>

        <label for="subject">Subject</label>
        <input type="text" id="subject" name="subject" placeholder="Regarding..." required>

        <label for="message">Message</label>
        <textarea id="message" name="message" placeholder="Your message here..." required></textarea>

        <input type="submit" value="Send Message" class="btn">
    </form>
</div>

<style>
    /* Styles specific to contact.md */
    .contact-info {
        display: flex;
        justify-content: center;
        gap: 40px;
        margin-bottom: 40px;
        flex-wrap: wrap; /* Allow items to wrap on smaller screens */
    }

    .contact-item {
        background-color: var(--light-bg);
        padding: 25px;
        border-radius: 8px;
        text-align: center;
        flex: 1; /* Allow items to grow/shrink */
        min-width: 280px; /* Minimum width before wrapping */
        box-shadow: 0 2px 8px rgba(0,0,0,0.05);
    }

    .contact-item h4 {
        color: var(--primary-accent);
        margin-bottom: 10px;
    }

    .contact-form-container {
        background-color: var(--light-bg);
        padding: 40px;
        border-radius: 8px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.08);
        border: 1px solid var(--border-color);
        max-width: 700px;
        margin: 0 auto;
    }

    .contact-form-container label {
        display: block;
        margin-bottom: 8px;
        font-weight: bold;
        color: var(--heading-color);
    }

    .contact-form-container input[type="text"],
    .contact-form-container input[type="email"],
    .contact-form-container textarea {
        width: calc(100% - 20px); /* Account for padding */
        padding: 12px 10px;
        margin-bottom: 20px;
        border: 1px solid var(--border-color);
        border-radius: 5px;
        font-size: 1em;
        background-color: var(--background-color);
        color: var(--text-color);
        box-sizing: border-box; /* Ensures padding is inside width */
    }

    .contact-form-container textarea {
        resize: vertical; /* Allow vertical resizing */
        min-height: 120px;
    }

    .contact-form-container input[type="submit"] {
        width: auto; /* Button fits content */
        display: block;
        margin-left: auto;
        margin-right: auto; /* Center button */
    }
</style>