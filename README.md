# Letter Editor Application

A modern web-based letter editor with Google Drive integration, PDF export, and rich text editing capabilities.

## Features

- Rich text editing with formatting options
- Google Drive integration for saving and loading documents
- PDF and HTML export options
- Auto-save functionality
- Responsive design
- Google Sign-In authentication

## Deployment

This application is deployed using GitHub Pages. To deploy your own instance:

1. Fork this repository
2. Go to Settings > Pages
3. Select the main branch as the source
4. Save the changes

Your application will be available at: `https://[your-username].github.io/[repository-name]`

## Local Development

To run the application locally:

1. Clone the repository
2. Open `index.html` in your web browser
3. For Google Drive integration, you'll need to:
   - Create a Google Cloud Project
   - Enable the Google Drive API
   - Create OAuth 2.0 credentials
   - Update the `CLIENT_ID` and `API_KEY` in `letter-editor.js`

## Technologies Used

- HTML5
- CSS3
- JavaScript
- Google Drive API
- html2pdf.js
