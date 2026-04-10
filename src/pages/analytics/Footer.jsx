import React from "react";

const WhatsAppIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
        <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.117 1.523 5.847L.057 23.882a.5.5 0 0 0 .611.611l6.101-1.459A11.945 11.945 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.9a9.893 9.893 0 0 1-5.031-1.371l-.36-.214-3.733.893.909-3.646-.235-.374A9.861 9.861 0 0 1 2.1 12C2.1 6.534 6.534 2.1 12 2.1c5.465 0 9.9 4.434 9.9 9.9 0 5.465-4.435 9.9-9.9 9.9z" />
    </svg>
);

const InstagramIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M7.75 2C4.57 2 2 4.57 2 7.75v8.5C2 19.43 4.57 22 7.75 22h8.5C19.43 22 22 19.43 22 16.25v-8.5C22 4.57 19.43 2 16.25 2h-8.5zm0 2h8.5A3.75 3.75 0 0 1 20 7.75v8.5A3.75 3.75 0 0 1 16.25 20h-8.5A3.75 3.75 0 0 1 4 16.25v-8.5A3.75 3.75 0 0 1 7.75 4zm8.75 1.5a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5zM12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm0 2a3 3 0 1 1 0 6 3 3 0 0 1 0-6z" />
    </svg>
);

const GitHubIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0C5.37 0 0 5.37 0 12a12 12 0 0 0 8.21 11.38c.6.11.82-.26.82-.58v-2.23c-3.34.73-4.04-1.61-4.04-1.61-.55-1.4-1.34-1.78-1.34-1.78-1.1-.75.08-.74.08-.74 1.22.09 1.86 1.25 1.86 1.25 1.08 1.85 2.83 1.32 3.52 1 .11-.78.42-1.32.76-1.62-2.67-.3-5.48-1.33-5.48-5.93 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.52.12-3.17 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.28-1.55 3.29-1.23 3.29-1.23.66 1.65.24 2.87.12 3.17.77.84 1.24 1.91 1.24 3.22 0 4.61-2.81 5.63-5.49 5.93.43.37.82 1.1.82 2.22v3.29c0 .32.22.7.83.58A12 12 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
    </svg>
);

const LinkedInIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M4.98 3.5C4.98 4.88 3.88 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5zM.5 8h4V24h-4V8zm7.5 0h3.8v2.16h.05c.53-1 1.83-2.16 3.77-2.16 4.03 0 4.78 2.65 4.78 6.1V24h-4v-7.9c0-1.88-.03-4.3-2.62-4.3-2.63 0-3.03 2.06-3.03 4.17V24h-4V8z" />
    </svg>
);

export default function Footer() {
    return (
        <footer className="analytics-footer">

            <div className="footer-brand">
                <span className="footer-hex">⬡</span>
                <span className="footer-brand-name">Coding Tracker</span>
            </div>

            <div className="footer-links">
                <a href="#" className="footer-link" onClick={(e) => e.preventDefault()}>
                    Terms &amp; Conditions
                </a>
                <span className="footer-dot">·</span>
                <a href="#" className="footer-link" onClick={(e) => e.preventDefault()}>
                    Privacy Policy
                </a>
                <span className="footer-dot">·</span>
                <a href="mailto:127156112@sastra.ac.in" className="footer-link">
                    Contact Us
                </a>
            </div>

            <div className="footer-socials">
                <a href="https://wa.me/" target="_blank" rel="noreferrer" className="footer-social-btn" title="WhatsApp">
                    <WhatsAppIcon />
                </a>
                <a href="https://instagram.com/" target="_blank" rel="noreferrer" className="footer-social-btn" title="Instagram">
                    <InstagramIcon />
                </a>
                <a href="https://github.com/chidvi123" target="_blank" rel="noreferrer" className="footer-social-btn" title="GitHub">
                    <GitHubIcon />
                </a>
                <a href="https://linkedin.com/" target="_blank" rel="noreferrer" className="footer-social-btn" title="LinkedIn">
                    <LinkedInIcon />
                </a>
            </div>

            <span className="footer-copy">
                {`© ${new Date().getFullYear()} Coding Tracker. All rights reserved.`}
            </span>

            <span className="footer-love">
                Made with <span className="footer-heart">&#9829;</span> by C &amp; J
            </span>

        </footer>
    );
}