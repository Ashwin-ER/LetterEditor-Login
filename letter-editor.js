// Google Drive API configuration
const CLIENT_ID = '884583274312-kht69ler7trtdf107mqav5g5gr8pihb5.apps.googleusercontent.com';
const API_KEY = 'AIzaSyB9cq8Ggd276w519uaKwNNqIR9wHJw_wc8';
const DISCOVERY_DOCS = ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'];
const SCOPES = 'https://www.googleapis.com/auth/drive.file';

let tokenClient;
let gapiInited = false;
let gisInited = false;
let currentFileId = null;
let currentUser = null;

// Initialize the editor
document.addEventListener('DOMContentLoaded', () => {
    // Check if user is already logged in
    const user = localStorage.getItem('currentUser');
    if (user) {
        currentUser = JSON.parse(user);
        showEditor();
    }

    // Initialize Google API
    gapi.load('client', initializeGapiClient);
});

// Show editor section and hide auth forms
function showEditor() {
    document.getElementById('authForms').style.display = 'none';
    document.getElementById('editorSection').style.display = 'block';
    document.getElementById('userName').textContent = `Welcome, ${currentUser.name}!`;
    
    // Load any existing draft from localStorage
    const savedDraft = localStorage.getItem(`letterDraft_${currentUser.email}`);
    if (savedDraft) {
        document.getElementById('editor').innerHTML = savedDraft;
    }
}

// Logout function
function logout() {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('letterDraft');
    currentUser = null;
    document.getElementById('authForms').style.display = 'block';
    document.getElementById('editorSection').style.display = 'none';
    document.getElementById('editor').innerHTML = '';
}

// Initialize the GAPI client
async function initializeGapiClient() {
    try {
        await gapi.client.init({
            apiKey: API_KEY,
            discoveryDocs: DISCOVERY_DOCS,
        });
        gapiInited = true;
        maybeEnableButtons();
    } catch (error) {
        console.error('Error initializing GAPI client:', error);
        updateSaveStatus('Error initializing Google Drive');
    }
}

// Initialize the Google Identity Services client
function initializeGisClient() {
    try {
        tokenClient = google.accounts.oauth2.initTokenClient({
            client_id: CLIENT_ID,
            scope: SCOPES,
            callback: '', // defined later
        });
        gisInited = true;
        maybeEnableButtons();
    } catch (error) {
        console.error('Error initializing GIS client:', error);
        updateSaveStatus('Error initializing Google Sign-In');
    }
}

// Enable buttons when both clients are initialized
function maybeEnableButtons() {
    if (gapiInited && gisInited) {
        document.querySelectorAll('.drive-actions button').forEach(button => {
            button.disabled = false;
        });
    }
}

// Text formatting functions
function formatText(command) {
    document.execCommand(command, false, null);
}

// Save draft to localStorage
function saveDraft() {
    if (!currentUser) return;
    const content = document.getElementById('editor').innerHTML;
    localStorage.setItem(`letterDraft_${currentUser.email}`, content);
    updateSaveStatus('Draft saved locally');
}

// Save to Google Drive
async function saveToDrive() {
    if (!currentUser) {
        updateSaveStatus('Please log in first');
        return;
    }

    try {
        // Initialize the API if not already done
        if (!gapi.client || !gapi.client.drive) {
            await initializeGapiClient();
        }

        // Get the current file ID from localStorage
        currentFileId = localStorage.getItem(`driveFileId_${currentUser.email}`);

        const content = document.getElementById('editor').innerHTML;
        const metadata = {
            name: `Letter_${currentUser.name}_${new Date().toISOString().split('T')[0]}`,
            mimeType: 'application/vnd.google-apps.document'
        };

        // Show loading status
        updateSaveStatus('Saving to Drive...');

        let file;
        if (currentFileId) {
            // Update existing file
            file = await gapi.client.drive.files.update({
                fileId: currentFileId,
                resource: metadata,
                media: {
                    mimeType: 'text/html',
                    body: content
                }
            });
        } else {
            // Create new file
            file = await gapi.client.drive.files.create({
                resource: metadata,
                media: {
                    mimeType: 'text/html',
                    body: content
                }
            });
            currentFileId = file.result.id;
        }

        // Store the file ID in localStorage
        localStorage.setItem(`driveFileId_${currentUser.email}`, currentFileId);
        updateSaveStatus('Successfully saved to Drive!');
    } catch (error) {
        console.error('Error saving to Drive:', error);
        if (error.status === 401) {
            // Handle unauthorized error
            updateSaveStatus('Please sign in with Google again');
            logout();
        } else {
            updateSaveStatus('Error saving to Drive. Please try again.');
        }
    }
}

// Load from Google Drive
async function loadFromDrive() {
    if (!currentUser) return;
    if (!gapi.client || !gapi.client.drive) {
        await initializeGapiClient();
    }

    try {
        const response = await gapi.client.drive.files.list({
            q: "mimeType='application/vnd.google-apps.document'",
            fields: 'files(id, name)',
            spaces: 'drive'
        });

        if (response.result.files.length > 0) {
            const file = response.result.files[0];
            const content = await gapi.client.drive.files.get({
                fileId: file.id,
                alt: 'media'
            });
            
            document.getElementById('editor').innerHTML = content.body;
            currentFileId = file.id;
            updateSaveStatus('Loaded from Drive');
        } else {
            updateSaveStatus('No files found in Drive');
        }
    } catch (error) {
        console.error('Error loading from Drive:', error);
        updateSaveStatus('Error loading from Drive');
    }
}

// Auto-save draft every 30 seconds
setInterval(saveDraft, 30000);

// Export functions for use in script.js
window.showEditor = showEditor;
window.logout = logout;

// Download menu functionality
function toggleDownloadMenu() {
    const dropdown = document.querySelector('.download-dropdown');
    dropdown.classList.toggle('active');
}

// Close download menu when clicking outside
document.addEventListener('click', (e) => {
    const dropdown = document.querySelector('.download-dropdown');
    if (!dropdown.contains(e.target)) {
        dropdown.classList.remove('active');
    }
});

// Download as HTML
function downloadAsHTML() {
    const content = document.getElementById('editor').innerHTML;
    const user = JSON.parse(localStorage.getItem('currentUser'));
    const fileName = `letter_${user.name}_${new Date().toISOString().split('T')[0]}.html`;
    
    // Create a complete HTML document
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>${fileName}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            max-width: 800px;
            margin: 0 auto;
            padding: 2rem;
        }
    </style>
</head>
<body>
    ${content}
</body>
</html>`;

    // Create blob and download
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    
    updateSaveStatus('Downloaded as HTML');
    document.querySelector('.download-dropdown').classList.remove('active');
}

// Download as PDF
async function downloadAsPDF() {
    try {
        const content = document.getElementById('editor').innerHTML;
        const user = JSON.parse(localStorage.getItem('currentUser'));
        const fileName = `letter_${user.name}_${new Date().toISOString().split('T')[0]}.pdf`;
        
        // Create a temporary div for PDF generation
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 2rem;">
                <h1 style="text-align: center; margin-bottom: 2rem;">Letter</h1>
                <div style="margin-bottom: 2rem;">
                    <p><strong>From:</strong> ${user.name}</p>
                    <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
                </div>
                <div style="border-top: 2px solid #333; padding-top: 2rem;">
                    ${content}
                </div>
            </div>
        `;
        
        // Configure PDF options
        const opt = {
            margin: 1,
            filename: fileName,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { 
                scale: 2,
                useCORS: true,
                logging: false
            },
            jsPDF: { 
                unit: 'in', 
                format: 'letter', 
                orientation: 'portrait'
            }
        };

        // Show loading status
        updateSaveStatus('Generating PDF...');

        // Generate PDF
        await html2pdf().set(opt).from(tempDiv).save();
        
        // Show success message
        updateSaveStatus('PDF downloaded successfully!');
    } catch (error) {
        console.error('Error generating PDF:', error);
        updateSaveStatus('Error generating PDF. Please try again.');
    }
    
    // Close the download menu
    document.querySelector('.download-dropdown').classList.remove('active');
}

// Update save status message
function updateSaveStatus(message) {
    const statusElement = document.getElementById('saveStatus');
    statusElement.textContent = message;
    setTimeout(() => {
        statusElement.textContent = '';
    }, 3000);
} 