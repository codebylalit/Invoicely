import React from "react";

const ContactUs = () => (
    <div style={{ padding: 24 }}>
        <h1>Contact Us</h1>
        <p>
            Have questions or need support? Reach out to us at <a href="mailto:support@example.com">support@example.com</a> or use the form below.
        </p>
        <form style={{ maxWidth: 400 }}>
            <div style={{ marginBottom: 12 }}>
                <label>Name:<br /><input type="text" name="name" style={{ width: '100%' }} /></label>
            </div>
            <div style={{ marginBottom: 12 }}>
                <label>Email:<br /><input type="email" name="email" style={{ width: '100%' }} /></label>
            </div>
            <div style={{ marginBottom: 12 }}>
                <label>Message:<br /><textarea name="message" rows={4} style={{ width: '100%' }} /></label>
            </div>
            <button type="submit">Send</button>
        </form>
    </div>
);

export default ContactUs; 