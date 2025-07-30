import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    const provider = new PixelForgeProvider(context.extensionUri);
    
    // Register the tree data provider
    vscode.window.registerTreeDataProvider('pixelforge.imageView', provider);
    
    // Register commands
    const generateImageCommand = vscode.commands.registerCommand('pixelforge.generateImage', async () => {
        console.log('Generate image command triggered');
        
        const prompt = await vscode.window.showInputBox({
            placeHolder: 'Enter your image description...',
            prompt: 'What would you like to generate?'
        });
        
        console.log('Prompt received:', prompt);
        
        if (prompt) {
            await generateImage(prompt, context);
        } else {
            console.log('No prompt provided');
        }
    });
    
    const setApiKeyCommand = vscode.commands.registerCommand('pixelforge.setApiKey', async () => {
        const apiKey = await vscode.window.showInputBox({
            placeHolder: 'Enter your Gemini API key',
            prompt: 'Get your API key from Google AI Studio',
            password: true
        });
        
        if (apiKey) {
            await context.globalState.update('pixelforge.apiKey', apiKey);
            vscode.window.showInformationMessage('API key saved successfully!');
        }
    });
    
    context.subscriptions.push(generateImageCommand, setApiKeyCommand);
}

class PixelForgeProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
    constructor(private extensionUri: vscode.Uri) {}
    
    getTreeItem(element: vscode.TreeItem): vscode.TreeItem {
        return element;
    }
    
    getChildren(): vscode.TreeItem[] {
        const generateItem = new vscode.TreeItem('🎨 Generate Image', vscode.TreeItemCollapsibleState.None);
        generateItem.command = {
            command: 'pixelforge.generateImage',
            title: 'Generate Image'
        };
        return [generateItem];
    }
}

async function generateImage(prompt: string, context: vscode.ExtensionContext) {
    console.log('generateImage function called with prompt:', prompt);
    
    const apiKey = context.globalState.get<string>('pixelforge.apiKey');
    console.log('API key found:', !!apiKey);
    
    if (!apiKey) {
        console.log('No API key found, showing warning');
        const result = await vscode.window.showWarningMessage(
            'No API key found. Would you like to set one?',
            'Set API Key'
        );
        
        if (result === 'Set API Key') {
            vscode.commands.executeCommand('pixelforge.setApiKey');
        }
        return;
    }
    
    try {
        console.log('Starting image generation process');
        
        // Show progress
        await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: "Generating image...",
            cancellable: false
        }, async (progress) => {
            progress.report({ increment: 0, message: "Sending request..." });
            console.log('Progress: Sending request');
            
            const requestBody = {
                contents: [{
                    parts: [{
                        text: `Generate an image: ${prompt}`
                    }]
                }],
                generationConfig: {
                    responseModalities: ["TEXT", "IMAGE"]
                }
            };
            
            console.log('Request body:', JSON.stringify(requestBody, null, 2));
            
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-preview-image-generation:generateContent?key=${apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });
            
            console.log('Response status:', response.status);
            console.log('Response ok:', response.ok);
            
            // Log some key headers without using entries()
            console.log('Content-Type:', response.headers.get('content-type'));
            console.log('Content-Length:', response.headers.get('content-length'));
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('API Error Response:', errorText);
                throw new Error(`API request failed: ${response.status} - ${errorText}`);
            }
            
            const data = await response.json();
            console.log('Response data structure:', JSON.stringify(data, null, 2));
            
            progress.report({ increment: 50, message: "Processing response..." });
            
            // Check response structure more carefully
            if (!data.candidates || !data.candidates[0]) {
                console.error('No candidates in response');
                throw new Error('No image candidates received from API');
            }
            
            const candidate = data.candidates[0];
            console.log('First candidate:', JSON.stringify(candidate, null, 2));
            
            if (!candidate.content || !candidate.content.parts) {
                console.error('Invalid candidate structure');
                throw new Error('Invalid response structure from API');
            }
            
            const parts = candidate.content.parts;
            console.log('Number of parts:', parts.length);
            
            // Find the image part and text part
            let imageData = null;
            let mimeType = null;
            let textDescription = '';
            
            for (const part of parts) {
                if (part.inlineData && part.inlineData.data) {
                    imageData = part.inlineData.data;
                    mimeType = part.inlineData.mimeType;
                    console.log('Found image data, length:', imageData.length);
                    console.log('MIME type:', mimeType);
                } else if (part.text) {
                    textDescription = part.text;
                    console.log('Found text description:', textDescription);
                }
            }
            
            if (imageData && mimeType) {
                // Create and show webview
                const panel = vscode.window.createWebviewPanel(
                    'pixelforgeImage',
                    `PixelForge: ${prompt}`,
                    vscode.ViewColumn.One,
                    {
                        enableScripts: true
                    }
                );
                
                panel.webview.html = getWebviewContent(imageData, mimeType, prompt, textDescription);
                console.log('Webview created and content set');
                
                progress.report({ increment: 100, message: "Image generated!" });
            } else {
                console.error('No image data found in any part');
                throw new Error('No image data found in API response');
            }
        });
        
        console.log('Image generation completed successfully');
        
    } catch (error: any) {
        console.error('Error in generateImage:', error);
        console.error('Error stack:', error.stack);
        vscode.window.showErrorMessage(`Failed to generate image: ${error.message}`);
    }
}

function getWebviewContent(imageData: string, mimeType: string, prompt: string, textDescription: string = ''): string {
    console.log('Creating webview content');
    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>PixelForge Image</title>
            <style>
                * {
                    box-sizing: border-box;
                }
                
                body {
                    margin: 0;
                    padding: 0;
                    font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
                    background: linear-gradient(135deg, var(--vscode-editor-background) 0%, rgba(30, 30, 40, 0.95) 100%);
                    color: var(--vscode-editor-foreground);
                    min-height: 100vh;
                    line-height: 1.6;
                    overflow-x: hidden;
                }
                
                /* Animated background pattern */
                body::before {
                    content: '';
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: 
                        radial-gradient(circle at 25% 25%, rgba(120, 119, 198, 0.1) 0%, transparent 50%),
                        radial-gradient(circle at 75% 75%, rgba(255, 99, 132, 0.08) 0%, transparent 50%),
                        radial-gradient(circle at 50% 50%, rgba(54, 162, 235, 0.05) 0%, transparent 50%);
                    pointer-events: none;
                    z-index: -1;
                    animation: float 20s ease-in-out infinite;
                }
                
                @keyframes float {
                    0%, 100% { transform: translateY(0px) rotate(0deg); }
                    33% { transform: translateY(-10px) rotate(1deg); }
                    66% { transform: translateY(5px) rotate(-1deg); }
                }
                
                .container {
                    max-width: 900px;
                    width: 100%;
                    margin: 0 auto;
                    padding: 40px 20px;
                    position: relative;
                }
                
                .header {
                    text-align: center;
                    margin-bottom: 40px;
                    padding: 30px 0;
                }
                
                .header h1 {
                    font-size: 2.5em;
                    font-weight: 300;
                    margin: 0 0 10px 0;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                    text-shadow: 0 4px 8px rgba(0,0,0,0.1);
                }
                
                .header .subtitle {
                    color: var(--vscode-descriptionForeground);
                    font-size: 1.1em;
                    opacity: 0.8;
                }
                
                .prompt-card {
                    background: rgba(255, 255, 255, 0.02);
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 16px;
                    padding: 24px;
                    margin-bottom: 30px;
                    box-shadow: 
                        0 8px 32px rgba(0, 0, 0, 0.3),
                        inset 0 1px 0 rgba(255, 255, 255, 0.1);
                    position: relative;
                    overflow: hidden;
                }
                
                .prompt-card::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 1px;
                    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
                }
                
                .prompt-card .label {
                    font-weight: 600;
                    color: #8892b0;
                    font-size: 0.9em;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    margin-bottom: 8px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                
                .prompt-card .label::before {
                    content: '✨';
                    font-size: 1.2em;
                }
                
                .prompt-card .content {
                    font-size: 1.05em;
                    line-height: 1.7;
                    color: var(--vscode-editor-foreground);
                }
                
                .image-showcase {
                    text-align: center;
                    background: rgba(0, 0, 0, 0.2);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    border-radius: 20px;
                    padding: 40px 30px;
                    margin: 30px 0;
                    box-shadow: 
                        0 20px 40px rgba(0, 0, 0, 0.4),
                        inset 0 1px 0 rgba(255, 255, 255, 0.05);
                    position: relative;
                    overflow: hidden;
                }
                
                .image-showcase::before {
                    content: '';
                    position: absolute;
                    top: -50%;
                    left: -50%;
                    width: 200%;
                    height: 200%;
                    background: conic-gradient(
                        from 0deg,
                        transparent,
                        rgba(120, 119, 198, 0.1),
                        transparent,
                        rgba(255, 99, 132, 0.1),
                        transparent,
                        rgba(54, 162, 235, 0.1),
                        transparent
                    );
                    animation: rotate 20s linear infinite;
                    pointer-events: none;
                }
                
                @keyframes rotate {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                
                .image-showcase .inner {
                    position: relative;
                    z-index: 1;
                    background: var(--vscode-editor-background);
                    border-radius: 16px;
                    padding: 20px;
                    border: 1px solid rgba(255, 255, 255, 0.05);
                }
                
                img {
                    max-width: 100%;
                    height: auto;
                    border-radius: 12px;
                    box-shadow: 
                        0 16px 32px rgba(0, 0, 0, 0.4),
                        0 4px 8px rgba(0, 0, 0, 0.2);
                    transition: transform 0.3s ease, box-shadow 0.3s ease;
                    cursor: pointer;
                }
                
                img:hover {
                    transform: scale(1.02);
                    box-shadow: 
                        0 20px 40px rgba(0, 0, 0, 0.5),
                        0 8px 16px rgba(0, 0, 0, 0.3);
                }
                
                .download-section {
                    margin-top: 40px;
                    text-align: center;
                    padding: 30px;
                    background: rgba(255, 255, 255, 0.015);
                    border-radius: 16px;
                    border: 1px solid rgba(255, 255, 255, 0.05);
                }
                
                .download-section .title {
                    font-size: 1.1em;
                    font-weight: 500;
                    color: var(--vscode-editor-foreground);
                    margin-bottom: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                }
                
                .download-section .title::before {
                    content: '💾';
                    font-size: 1.3em;
                }
                
                .download-buttons {
                    display: flex;
                    gap: 16px;
                    justify-content: center;
                    flex-wrap: wrap;
                }
                
                .download-btn {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    border: none;
                    padding: 14px 28px;
                    border-radius: 12px;
                    cursor: pointer;
                    font-size: 14px;
                    font-weight: 500;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    transition: all 0.3s ease;
                    box-shadow: 
                        0 6px 20px rgba(102, 126, 234, 0.3),
                        0 2px 4px rgba(0, 0, 0, 0.2);
                    position: relative;
                    overflow: hidden;
                    min-width: 120px;
                }
                
                .download-btn::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: -100%;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
                    transition: left 0.5s ease;
                }
                
                .download-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 
                        0 10px 30px rgba(102, 126, 234, 0.4),
                        0 4px 8px rgba(0, 0, 0, 0.3);
                }
                
                .download-btn:hover::before {
                    left: 100%;
                }
                
                .download-btn:active {
                    transform: translateY(0);
                    box-shadow: 
                        0 4px 15px rgba(102, 126, 234, 0.3),
                        0 2px 4px rgba(0, 0, 0, 0.2);
                }
                
                .download-btn.png {
                    background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
                    box-shadow: 
                        0 6px 20px rgba(17, 153, 142, 0.3),
                        0 2px 4px rgba(0, 0, 0, 0.2);
                }
                
                .download-btn.png:hover {
                    box-shadow: 
                        0 10px 30px rgba(17, 153, 142, 0.4),
                        0 4px 8px rgba(0, 0, 0, 0.3);
                }
                
                .download-btn.jpg {
                    background: linear-gradient(135deg, #fc466b 0%, #3f5efb 100%);
                    box-shadow: 
                        0 6px 20px rgba(252, 70, 107, 0.3),
                        0 2px 4px rgba(0, 0, 0, 0.2);
                }
                
                .download-btn.jpg:hover {
                    box-shadow: 
                        0 10px 30px rgba(252, 70, 107, 0.4),
                        0 4px 8px rgba(0, 0, 0, 0.3);
                }
                
                .footer {
                    margin-top: 50px;
                    text-align: center;
                    color: var(--vscode-descriptionForeground);
                    font-size: 13px;
                    opacity: 0.6;
                    padding: 20px 0;
                    border-top: 1px solid rgba(255, 255, 255, 0.05);
                }
                
                .footer .brand {
                    font-weight: 600;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }
                
                .error {
                    color: #ff6b6b;
                    background: rgba(255, 107, 107, 0.1);
                    border: 1px solid rgba(255, 107, 107, 0.3);
                    padding: 20px;
                    border-radius: 12px;
                    margin: 20px 0;
                    text-align: center;
                    font-weight: 500;
                }
                
                /* Loading animation */
                .loading {
                    display: inline-block;
                    width: 20px;
                    height: 20px;
                    border: 2px solid rgba(255, 255, 255, 0.3);
                    border-radius: 50%;
                    border-top-color: #667eea;
                    animation: spin 1s ease-in-out infinite;
                    margin-right: 10px;
                }
                
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
                
                /* Responsive design */
                @media (max-width: 600px) {
                    .container {
                        padding: 20px 15px;
                    }
                    
                    .header h1 {
                        font-size: 2em;
                    }
                    
                    .download-buttons {
                        flex-direction: column;
                        align-items: center;
                    }
                    
                    .download-btn {
                        width: 100%;
                        max-width: 200px;
                    }
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>PixelForge</h1>
                    <div class="subtitle">AI-Powered Image Generation</div>
                </div>
                
                <div class="prompt-card">
                    <div class="label">Your Prompt</div>
                    <div class="content">${prompt}</div>
                </div>
                
                ${textDescription ? `
                <div class="prompt-card">
                    <div class="label">AI Description</div>
                    <div class="content">${textDescription}</div>
                </div>
                ` : ''}
                
                <div class="image-showcase">
                    <div class="inner">
                        <img 
                            id="generated-image"
                            src="data:${mimeType};base64,${imageData}" 
                            alt="Generated image"
                            onerror="this.style.display='none'; document.getElementById('error-msg').style.display='block';"
                            onload="console.log('Image loaded successfully');"
                        />
                        <div id="error-msg" class="error" style="display: none;">
                            Failed to load image. Check the console for details.
                        </div>
                    </div>
                </div>
                
                <div class="download-section">
                    <div class="title">Save Your Creation</div>
                    <div class="download-buttons">
                        <button class="download-btn png" onclick="downloadImage('png')">
                            📸 PNG Format
                        </button>
                        <button class="download-btn jpg" onclick="downloadImage('jpg')">
                            🖼️ JPG Format
                        </button>
                    </div>
                </div>
                
                <div class="footer">
                    Crafted with <span class="brand">PixelForge</span> • Powered by Gemini AI
                </div>
            </div>
            <script>
                console.log('Webview loaded');
                console.log('Image data length:', '${imageData}'.length);
                console.log('MIME type:', '${mimeType}');
                
                // Wait for image to load before enabling downloads
                window.addEventListener('load', function() {
                    const img = document.getElementById('generated-image');
                    if (img) {
                        img.addEventListener('load', function() {
                            console.log('Image fully loaded, downloads enabled');
                        });
                        
                        img.addEventListener('error', function() {
                            console.error('Image failed to load');
                        });
                    }
                });
                
                function downloadImage(format) {
                    console.log('Download initiated for format:', format);
                    
                    try {
                        const img = document.getElementById('generated-image');
                        
                        if (!img) {
                            console.error('Image element not found');
                            alert('Error: Image not found');
                            return;
                        }
                        
                        if (!img.complete || img.naturalWidth === 0) {
                            console.error('Image not loaded properly');
                            alert('Please wait for the image to load completely');
                            return;
                        }
                        
                        // Show loading state
                        const button = event.target;
                        const originalText = button.innerHTML;
                        button.innerHTML = '<div class="loading"></div>Processing...';
                        button.disabled = true;
                        
                        console.log('Image dimensions:', img.naturalWidth + 'x' + img.naturalHeight);
                        
                        const canvas = document.createElement('canvas');
                        const ctx = canvas.getContext('2d');
                        
                        canvas.width = img.naturalWidth;
                        canvas.height = img.naturalHeight;
                        
                        // For JPG, fill with white background
                        if (format === 'jpg') {
                            ctx.fillStyle = 'white';
                            ctx.fillRect(0, 0, canvas.width, canvas.height);
                        }
                        
                        ctx.drawImage(img, 0, 0);
                        console.log('Image drawn to canvas');
                        
                        const mimeType = format === 'png' ? 'image/png' : 'image/jpeg';
                        const quality = format === 'jpg' ? 0.9 : undefined;
                        
                        function resetButton() {
                            setTimeout(function() {
                                button.innerHTML = originalText;
                                button.disabled = false;
                            }, 1000);
                        }
                        
                        // Try modern blob approach first
                        if (canvas.toBlob) {
                            canvas.toBlob(function(blob) {
                                if (!blob) {
                                    console.error('Failed to create blob');
                                    fallbackDownload(img, format);
                                    resetButton();
                                    return;
                                }
                                
                                console.log('Blob created, size:', blob.size);
                                
                                try {
                                    // Create download link
                                    const url = URL.createObjectURL(blob);
                                    const a = document.createElement('a');
                                    a.href = url;
                                    a.download = 'pixelforge-' + new Date().toISOString().slice(0,19).replace(/:/g, '-') + '.' + format;
                                    
                                    // Force download by adding to DOM and clicking
                                    document.body.appendChild(a);
                                    a.click();
                                    document.body.removeChild(a);
                                    
                                    // Clean up
                                    setTimeout(function() {
                                        URL.revokeObjectURL(url);
                                        console.log('Successfully downloaded as ' + format.toUpperCase());
                                    }, 1000);
                                    
                                    resetButton();
                                    
                                } catch (error) {
                                    console.error('Download error:', error);
                                    fallbackDownload(img, format);
                                    resetButton();
                                }
                            }, mimeType, quality);
                        } else {
                            // Fallback for older browsers
                            console.log('Using dataURL fallback');
                            try {
                                const dataURL = canvas.toDataURL(mimeType, quality);
                                const a = document.createElement('a');
                                a.href = dataURL;
                                a.download = 'pixelforge-' + new Date().toISOString().slice(0,19).replace(/:/g, '-') + '.' + format;
                                
                                document.body.appendChild(a);
                                a.click();
                                document.body.removeChild(a);
                                
                                console.log('Downloaded using dataURL as ' + format.toUpperCase());
                                resetButton();
                                
                            } catch (error) {
                                console.error('DataURL fallback error:', error);
                                fallbackDownload(img, format);
                                resetButton();
                            }
                        }
                        
                    } catch (error) {
                        console.error('General download error:', error);
                        alert('Download failed: ' + error.message);
                    }
                }
                
                function fallbackDownload(img, format) {
                    console.log('Using fallback download method');
                    try {
                        // Open image in new window as last resort
                        const canvas = document.createElement('canvas');
                        const ctx = canvas.getContext('2d');
                        canvas.width = img.naturalWidth;
                        canvas.height = img.naturalHeight;
                        
                        if (format === 'jpg') {
                            ctx.fillStyle = 'white';
                            ctx.fillRect(0, 0, canvas.width, canvas.height);
                        }
                        
                        ctx.drawImage(img, 0, 0);
                        const dataURL = canvas.toDataURL(format === 'jpg' ? 'image/jpeg' : 'image/png', 0.9);
                        
                        const newWindow = window.open();
                        newWindow.document.write(
                            '<html>' +
                                '<head><title>Download Image</title></head>' +
                                '<body style="margin:0; background:#000; display:flex; justify-content:center; align-items:center; min-height:100vh;">' +
                                    '<div style="text-align:center; color:white; font-family:sans-serif;">' +
                                        '<img src="' + dataURL + '" style="max-width:90vw; max-height:80vh; border-radius:8px;" />' +
                                        '<br><br>' +
                                        '<p>Right-click the image above and select "Save image as..." to download</p>' +
                                        '<button onclick="window.close()" style="padding:10px 20px; background:#667eea; color:white; border:none; border-radius:5px; cursor:pointer;">Close</button>' +
                                    '</div>' +
                                '</body>' +
                            '</html>'
                        );
                        
                    } catch (fallbackError) {
                        console.error('Fallback download also failed:', fallbackError);
                        alert('Download failed. Please right-click the image and select "Save image as..."');
                    }
                }
                
                // Test function to verify image data
                function testImageData() {
                    const img = document.getElementById('generated-image');
                    console.log('Image element:', img);
                    console.log('Image src length:', img ? img.src.length : 'No image');
                    console.log('Image complete:', img ? img.complete : 'No image');
                    console.log('Image dimensions:', img ? (img.naturalWidth + 'x' + img.naturalHeight) : 'No image');
                }
                
                // Call test function after a short delay
                setTimeout(testImageData, 1000);
                
            </script>
        </body>
        </html>
    `;
}

export function deactivate() {}