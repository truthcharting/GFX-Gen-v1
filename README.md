# 3D Text Generator PWA

A Progressive Web App (PWA) that transforms your text into stunning 3D graphics with animation and video recording capabilities.

## 🌟 Features

### Core Functionality
- **3D Text Generation**: Convert any text into beautiful 3D graphics
- **Foreground Images**: Use custom images as foreground elements (replaces text)
- **PNG Transparency**: Full support for PNG images with transparent backgrounds
- **Background Images**: Add custom background images to your 3D scenes
- **Multi-line Support**: Support for multi-line text with proper formatting
- **High-Quality Rendering**: Uses Three.js with maximum quality settings

### Animation & Recording
- **Keyframe Animation**: Set start and end positions for smooth camera animations
- **7-Second Animations**: Pre-configured 7-second animation duration
- **Video Recording**: Record your 3D animations as MP4 videos
- **Direct Download**: Save videos directly to your device

### Interactive Controls
- **Touch Controls**: Drag to rotate, pinch to zoom, double-tap to reset
- **Mouse Controls**: Full mouse support for desktop users
- **Responsive Design**: Works perfectly on mobile and desktop

### PWA Features
- **Installable**: Add to home screen on mobile devices
- **Offline Support**: Works without internet connection
- **App-like Experience**: Full-screen standalone mode
- **Fast Loading**: Optimized for quick startup

## 🚀 Getting Started

### Quick Start
1. Open `index.html` in a modern web browser
2. Enter your text in the input field
3. Optionally upload a background image
4. Click "Generate 3D Text"
5. Use touch/mouse to control the camera
6. Set keyframes and create animations

### Installation (PWA)
1. Open the app in Chrome/Safari on mobile
2. Tap the "Add to Home Screen" option
3. The app will now work like a native app

## 📱 Usage Guide

### Creating 3D Content
1. **Input Text**: Type or paste your text (up to 100 characters)
2. **Foreground Image (Optional)**: Upload an image to replace the text (supports PNG transparency)
3. **Background (Optional)**: Upload an image for the background
4. **Generate**: Click the button to create your 3D scene

**Note**: If both text and foreground image are provided, the foreground image will be used instead of the text.

### Camera Controls
- **Rotate**: Drag with one finger/mouse to rotate the camera
- **Zoom**: Pinch with two fingers or use mouse wheel
- **Reset**: Double-tap or double-click to reset camera position

### Creating Animations
1. **Set Start Keyframe**: Position camera and click "Set Start"
2. **Set End Keyframe**: Move camera to desired end position and click "Set End"
3. **Play Animation**: Click "Play" to preview the animation
4. **Record Video**: Click "Render Video" to record and download

### Video Features
- **High Quality**: 5 Mbps video recording with VP9 codec
- **Mobile Save**: Long-press video to save to camera roll (iOS)
- **Desktop Download**: Right-click video to save locally
- **Fallback Download**: Use the download button if needed

### Image Support
- **Foreground Images**: PNG, JPG, JPEG, WebP (PNG transparency supported)
- **Background Images**: PNG, JPG, JPEG, WebP
- **High Quality**: Maintains aspect ratio and image quality
- **Transparency**: Full PNG alpha channel support for foreground images

## 🛠️ Technical Details

### Technologies Used
- **Three.js**: 3D graphics and rendering
- **WebGL**: Hardware-accelerated graphics
- **MediaRecorder API**: Video recording
- **Service Workers**: PWA functionality
- **Canvas API**: High-quality text rendering

### Browser Support
- **Chrome**: Full support (recommended)
- **Safari**: Full support on iOS/macOS
- **Firefox**: Full support
- **Edge**: Full support

### Performance
- **Mobile Optimized**: Touch-friendly controls
- **High FPS**: 60fps rendering on capable devices
- **Memory Efficient**: Automatic cleanup of resources
- **Responsive**: Adapts to any screen size

## 📁 File Structure

```
3D GFX GENERATOR/
├── index.html          # Main application file
├── app.js             # JavaScript functionality
├── manifest.json      # PWA manifest
└── README.md         # This file
```

## 🎨 Customization

### Styling
The app uses a dark theme with blue accents. You can modify the CSS in `index.html` to change:
- Colors and gradients
- Font sizes and families
- Button styles and animations
- Layout and spacing

### 3D Settings
Modify the 3D rendering settings in `app.js`:
- Camera field of view
- Lighting setup
- Texture quality
- Animation duration

## 🔧 Development

### Local Development
1. Clone or download the files
2. Open `index.html` in a web browser
3. Use a local server for PWA features:
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node.js
   npx serve .
   ```

### Building for Production
The app is already optimized for production. For deployment:
1. Upload all files to your web server
2. Ensure HTTPS is enabled (required for PWA)
3. Test on various devices and browsers

## 🐛 Troubleshooting

### Common Issues
- **Text not appearing**: Check if the font is loading properly
- **Video not recording**: Ensure browser supports MediaRecorder API
- **PWA not installing**: Check if HTTPS is enabled
- **Performance issues**: Try on a more powerful device

### Browser Compatibility
- **iOS Safari**: Full support, including video saving
- **Android Chrome**: Full support with PWA installation
- **Desktop browsers**: Full support with mouse controls

## 📄 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Feel free to contribute by:
- Reporting bugs
- Suggesting new features
- Improving the documentation
- Submitting pull requests

## 📞 Support

For support or questions:
1. Check the troubleshooting section above
2. Test on different browsers/devices
3. Ensure you're using a modern browser

---

**Enjoy creating stunning 3D text animations!** 🎉 