# 🎨 PixelForge AI Image Generator

<div align="center">

![PixelForge Logo](https://img.shields.io/badge/PixelForge-AI%20Image%20Generator-blueviolet?style=for-the-badge&logo=visualstudiocode)

**Transform your imagination into stunning visuals directly within VS Code**

[![Version](https://img.shields.io/badge/version-1.0.0-blue?style=flat-square)](https://github.com/yourusername/PixelForge-AI-image-generator-vscode)
[![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)](LICENSE)
[![VS Code](https://img.shields.io/badge/VS%20Code-Extension-007ACC?style=flat-square&logo=visualstudiocode)](https://marketplace.visualstudio.com/vscode)
[![Gemini AI](https://img.shields.io/badge/Powered%20by-Gemini%20AI-orange?style=flat-square)](https://ai.google.dev/)

</div>

---

## ✨ Features

🚀 **Seamless Integration** - Generate images without leaving your development environment  
🎯 **Smart Prompting** - Intuitive text-to-image generation powered by Google Gemini AI  
🖼️ **Multiple Formats** - Download your creations in PNG or JPG format  
🔒 **Secure API Management** - Safe storage of your API keys within VS Code  
🎨 **Beautiful UI** - Modern, responsive webview with stunning visual effects  
📱 **Cross-Platform** - Works on Windows, macOS, and Linux  

## 🎬 Demo

<div align="center">

![PixelForge Demo](https://via.placeholder.com/800x400/667eea/ffffff?text=PixelForge+Demo+GIF)

*Generate stunning AI images with just a few clicks*

</div>

## 🚀 Quick Start

### Installation

1. **From VS Code Marketplace** (Recommended)
   - Open VS Code
   - Go to Extensions (`Ctrl+Shift+X` / `Cmd+Shift+X`)
   - Search for "PixelForge AI Image Generator"
   - Click Install

2. **From GitHub**
   ```bash
   git clone https://github.com/yourusername/PixelForge-AI-image-generator-vscode.git
   cd PixelForge-AI-image-generator-vscode
   npm install
   npm run compile
   ```

### Setup

1. **Get your Gemini API Key**
   - Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
   - Create a new API key
   - Copy the key for later use

2. **Configure PixelForge**
   - Open VS Code
   - Open Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`)
   - Run `PixelForge: Set API Key`
   - Paste your Gemini API key

## 🎯 Usage

### Method 1: Command Palette
1. Press `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (macOS)
2. Type "PixelForge: Generate Image"
3. Enter your image description
4. Watch the magic happen! ✨

### Method 2: Explorer Panel
1. Look for the **PixelForge** section in the Explorer panel
2. Click on **🎨 Generate Image**
3. Enter your prompt and generate

### Method 3: Keyboard Shortcut
- Press `Ctrl+Alt+P` (Windows/Linux) or `Cmd+Alt+P` (macOS)
- Quick access to image generation

## 🎨 Examples

| Prompt | Result |
|--------|---------|
| `"A mystical forest with glowing mushrooms at twilight"` | ![Forest](https://via.placeholder.com/200x150/4CAF50/ffffff?text=Mystical+Forest) |
| `"Cyberpunk cityscape with neon lights and flying cars"` | ![Cyberpunk](https://via.placeholder.com/200x150/9C27B0/ffffff?text=Cyberpunk+City) |
| `"Minimalist mountain landscape in watercolor style"` | ![Mountains](https://via.placeholder.com/200x150/2196F3/ffffff?text=Mountain+Art) |

## ⚙️ Configuration

PixelForge can be customized through VS Code settings:

```json
{
  "pixelforge.defaultFormat": "png",
  "pixelforge.autoDownload": false,
  "pixelforge.showPreview": true
}
```

### Available Settings

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `pixelforge.defaultFormat` | string | `"png"` | Default download format |
| `pixelforge.autoDownload` | boolean | `false` | Automatically download generated images |
| `pixelforge.showPreview` | boolean | `true` | Show image preview in webview |

## 🔧 Commands

| Command | Description | Shortcut |
|---------|-------------|----------|
| `pixelforge.generateImage` | Generate a new image | `Ctrl+Alt+P` |
| `pixelforge.setApiKey` | Set or update API key | - |

## 🛠️ Development

### Prerequisites
- Node.js 16+
- VS Code 1.74+
- TypeScript 4.9+

### Setup Development Environment

```bash
# Clone the repository
git clone https://github.com/yourusername/PixelForge-AI-image-generator-vscode.git
cd PixelForge-AI-image-generator-vscode

# Install dependencies
npm install

# Compile TypeScript
npm run compile

# Run tests
npm test

# Package extension
npm run package
```

### Project Structure

```
pixelforge/
├── src/
│   ├── extension.ts          # Main extension logic
│   └── test/                 # Test files
├── media/                    # Icons and assets
├── package.json              # Extension manifest
├── tsconfig.json            # TypeScript configuration
└── README.md                # This file
```

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. **🍴 Fork the repository**
2. **🌿 Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **💾 Commit your changes** (`git commit -m 'Add amazing feature'`)
4. **📤 Push to the branch** (`git push origin feature/amazing-feature`)
5. **🔄 Open a Pull Request**

### Contribution Guidelines

- Follow the existing code style
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Google Gemini AI** - For providing the powerful image generation API
- **VS Code Team** - For the excellent extension development platform
- **Community Contributors** - Thank you for your valuable feedback and contributions

## 📚 Resources

- [VS Code Extension API](https://code.visualstudio.com/api)
- [Google Gemini AI Documentation](https://ai.google.dev/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)

## 🐛 Issues & Support

Encountered a bug or have a feature request?

- 🐛 [Report Issues](https://github.com/yourusername/PixelForge-AI-image-generator-vscode/issues)
- 💡 [Request Features](https://github.com/yourusername/PixelForge-AI-image-generator-vscode/issues/new?template=feature_request.md)
- 📧 [Contact Support](mailto:support@pixelforge.dev)

## 🔮 Roadmap

- [ ] **Batch Generation** - Generate multiple images at once
- [ ] **Style Presets** - Quick access to popular art styles
- [ ] **Image Editing** - Basic editing tools within VS Code
- [ ] **Team Collaboration** - Share generated images with team members
- [ ] **Custom Models** - Support for additional AI models
- [ ] **History Management** - Keep track of generation history

---

<div align="center">

**Made with ❤️ by the PixelForge Team**

[⭐ Star this repo](https://github.com/yourusername/PixelForge-AI-image-generator-vscode) if you found it helpful!

[![GitHub stars](https://img.shields.io/github/stars/yourusername/PixelForge-AI-image-generator-vscode?style=social)](https://github.com/yourusername/PixelForge-AI-image-generator-vscode/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/yourusername/PixelForge-AI-image-generator-vscode?style=social)](https://github.com/yourusername/PixelForge-AI-image-generator-vscode/network/members)

</div>
