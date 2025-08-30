class TextGenerator3D {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.textMesh = null;
        this.backgroundMesh = null;
        this.controls = null;
        this.isMouseDown = false;
        this.previousMousePosition = { x: 0, y: 0 };
        this.rotation = { x: 0, y: 0 };
        this.targetRotation = { x: 0, y: 0 };
        this.distance = 5;
        this.targetDistance = 5;
        this.pointOfInterest = new THREE.Vector3(0, 0, 0); // Point of interest for camera
        this.backgroundImage = null;
        this.foregroundImage = null;
        this.entranceAnimation = null;
        
        // Animation system
        this.isAnimating = false;
        this.animationStartTime = 0;
        this.animationDuration = 7000; // 7 seconds
        this.keyframes = {
            start: null,
            end: null
        };
        
        // Entrance animation system
        this.isEntranceAnimating = false;
        this.entranceStartTime = 0;
        this.entranceDuration = 3000; // 3 seconds for entrance - longer for smoother animation
        this.entranceEndTime = 2333; // 1/3 of 7 seconds (2333ms)
        
        // Recording system
        this.isRecording = false;
        this.mediaRecorder = null;
        this.recordedChunks = [];
        this.currentVideoBlob = null;
        
        this.initializeElements();
        this.setupEventListeners();
    }

    initializeElements() {
        this.inputScreen = document.getElementById('inputScreen');
        this.canvasScreen = document.getElementById('canvasScreen');
        this.textInput = document.getElementById('textInput');
        this.foregroundInput = document.getElementById('foregroundInput');
        this.foregroundPreview = document.getElementById('foregroundPreview');
        this.animationOptions = document.getElementById('animationOptions');
        this.backgroundInput = document.getElementById('backgroundInput');
        this.filePreview = document.getElementById('filePreview');
        this.nextButton = document.getElementById('nextButton');
        this.backButton = document.getElementById('backButton');
        this.loading = document.getElementById('loading');
        this.canvasContainer = document.getElementById('canvas-container');
        
        // Animation controls
        this.animationControls = document.getElementById('animationControls');
        this.setStartBtn = document.getElementById('setStartBtn');
        this.setEndBtn = document.getElementById('setEndBtn');
        this.playBtn = document.getElementById('playBtn');
        this.renderBtn = document.getElementById('renderBtn');
        this.keyframeStatus = document.getElementById('keyframeStatus');
        
        // Video modal elements
        this.videoModal = document.getElementById('videoModal');
        this.renderedVideo = document.getElementById('renderedVideo');
        this.closeModal = document.getElementById('closeModal');
        this.downloadFallback = document.getElementById('downloadFallback');
        
        // Camera mode indicator
        this.cameraModeIndicator = document.getElementById('cameraModeIndicator');
    }

    setupEventListeners() {
        this.textInput.addEventListener('input', () => {
            this.updateNextButtonState();
        });

        this.foregroundInput.addEventListener('change', (e) => {
            this.handleForegroundFileUpload(e);
        });

        // Animation options event listeners
        document.querySelectorAll('input[name="entranceAnimation"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.entranceAnimation = e.target.value;
            });
        });

        this.backgroundInput.addEventListener('change', (e) => {
            this.handleBackgroundFileUpload(e);
        });

        this.nextButton.addEventListener('click', () => {
            this.showCanvasScreen();
        });

        this.backButton.addEventListener('click', () => {
            this.showInputScreen();
        });

        // Animation control listeners
        this.setStartBtn.addEventListener('click', () => {
            this.setKeyframe('start');
        });

        this.setEndBtn.addEventListener('click', () => {
            this.setKeyframe('end');
        });

        this.playBtn.addEventListener('click', () => {
            this.playAnimation();
        });

        this.renderBtn.addEventListener('click', () => {
            this.startRender();
        });

        // Video modal listeners
        this.closeModal.addEventListener('click', () => {
            this.closeVideoModal();
        });

        this.downloadFallback.addEventListener('click', () => {
            this.downloadVideo();
        });

        // Close modal when clicking outside
        this.videoModal.addEventListener('click', (e) => {
            if (e.target === this.videoModal) {
                this.closeVideoModal();
            }
        });

        // Touch and mouse events for orbit controls
        this.setupOrbitControls();
    }

    updateNextButtonState() {
        const hasText = this.textInput.value.trim().length > 0;
        const hasForegroundImage = this.foregroundImage !== null;
        this.nextButton.disabled = !(hasText || hasForegroundImage);
    }

    handleForegroundFileUpload(event) {
        const file = event.target.files[0];
        const fileLabel = document.querySelector('label[for="foregroundInput"]');
        
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                this.foregroundImage = e.target.result;
                
                // Update UI
                fileLabel.classList.add('has-file');
                fileLabel.querySelector('.file-label-text').textContent = 'Foreground Selected ✓';
                
                // Show preview
                this.foregroundPreview.innerHTML = `
                    <img src="${this.foregroundImage}" alt="Foreground preview">
                    <div class="file-name">${file.name}</div>
                `;
                
                // Show animation options
                this.animationOptions.style.display = 'block';
                
                // Update button state
                this.updateNextButtonState();
            };
            reader.readAsDataURL(file);
        } else {
            // Reset if invalid file
            this.foregroundImage = null;
            fileLabel.classList.remove('has-file');
            fileLabel.querySelector('.file-label-text').textContent = 'Choose Foreground Image (Optional - replaces text)';
            this.foregroundPreview.innerHTML = '';
            this.animationOptions.style.display = 'none';
            this.entranceAnimation = null;
            // Uncheck all radio buttons
            document.querySelectorAll('input[name="entranceAnimation"]').forEach(radio => {
                radio.checked = false;
            });
            this.updateNextButtonState();
        }
    }

    handleBackgroundFileUpload(event) {
        const file = event.target.files[0];
        const fileLabel = document.querySelector('.file-label');
        
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                this.backgroundImage = e.target.result;
                
                // Update UI
                fileLabel.classList.add('has-file');
                fileLabel.querySelector('.file-label-text').textContent = 'Background Selected ✓';
                
                // Show preview
                this.filePreview.innerHTML = `
                    <img src="${this.backgroundImage}" alt="Background preview">
                    <div class="file-name">${file.name}</div>
                `;
            };
            reader.readAsDataURL(file);
        } else {
            // Reset if invalid file
            this.backgroundImage = null;
            fileLabel.classList.remove('has-file');
            fileLabel.querySelector('.file-label-text').textContent = 'Choose Background Image (Optional)';
            this.filePreview.innerHTML = '';
        }
    }

    setupOrbitControls() {
        let lastTouchDistance = 0;
        
        // Only prevent default touch behaviors on the 3D canvas area
        const canvas3D = () => this.canvasContainer;
        
        // Prevent context menu on long press
        document.addEventListener('contextmenu', (e) => {
            // Allow context menu on video element
            if (e.target.tagName === 'VIDEO') {
                return; // Don't prevent - allow normal video context menu
            }
            e.preventDefault();
        });
        
        // Prevent zoom gestures only
        document.addEventListener('gesturestart', (e) => {
            e.preventDefault();
        });
        
        document.addEventListener('gesturechange', (e) => {
            e.preventDefault();
        });
        
        document.addEventListener('gestureend', (e) => {
            e.preventDefault();
        });
        
        // Mouse events
        document.addEventListener('mousedown', (e) => {
            if (this.canvasScreen.classList.contains('hidden')) return;
            
            // Only handle mouse events on the canvas area
            if (canvas3D() && canvas3D().contains(e.target)) {
                this.isMouseDown = true;
                this.isPanning = e.shiftKey; // Track if we're panning (shift + click)
                this.previousMousePosition = { x: e.clientX, y: e.clientY };
                e.preventDefault();
            }
        });

        document.addEventListener('mousemove', (e) => {
            if (!this.isMouseDown || this.canvasScreen.classList.contains('hidden')) return;
            
            // Check if shift key state changed during drag
            if (this.isMouseDown && e.shiftKey !== this.isPanning) {
                this.isPanning = e.shiftKey;
            }
            
            if (this.isPanning) {
                this.handlePan(e.clientX, e.clientY);
                this.updateCameraModeIndicator('Pan Mode');
            } else {
                this.handleRotation(e.clientX, e.clientY);
                this.updateCameraModeIndicator('Orbit Mode');
            }
            e.preventDefault();
        });

        document.addEventListener('mouseup', (e) => {
            this.isMouseDown = false;
            this.isPanning = false;
        });

        // Touch events for 3D controls - only on canvas area
        document.addEventListener('touchstart', (e) => {
            if (this.canvasScreen.classList.contains('hidden')) return;
            
            // Only handle touch events on the canvas area
            if (canvas3D() && canvas3D().contains(e.target)) {
                if (e.touches.length === 1) {
                    this.isMouseDown = true;
                    this.previousMousePosition = { 
                        x: e.touches[0].clientX, 
                        y: e.touches[0].clientY 
                    };
                } else if (e.touches.length === 2) {
                    this.isMouseDown = false;
                    const dx = e.touches[0].clientX - e.touches[1].clientX;
                    const dy = e.touches[0].clientY - e.touches[1].clientY;
                    lastTouchDistance = Math.sqrt(dx * dx + dy * dy);
                }
                e.preventDefault();
            }
        }, { passive: false });

        document.addEventListener('touchmove', (e) => {
            if (this.canvasScreen.classList.contains('hidden')) return;
            
            // Only handle touch events on the canvas area or if we're already dragging
            if ((canvas3D() && canvas3D().contains(e.target)) || this.isMouseDown) {
                if (e.touches.length === 1 && this.isMouseDown) {
                    this.handleRotation(e.touches[0].clientX, e.touches[0].clientY);
                } else if (e.touches.length === 2) {
                    const dx = e.touches[0].clientX - e.touches[1].clientX;
                    const dy = e.touches[0].clientY - e.touches[1].clientY;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (lastTouchDistance > 0) {
                        // More stable zoom calculation
                        const scale = distance / lastTouchDistance;
                        const zoomFactor = (scale - 1) * 2; // Adjust sensitivity
                        this.targetDistance = Math.max(2, Math.min(15, this.targetDistance - zoomFactor));
                    }
                    lastTouchDistance = distance;
                }
                e.preventDefault();
            }
        }, { passive: false });

        document.addEventListener('touchend', (e) => {
            if (this.canvasScreen.classList.contains('hidden')) return;
            
            this.isMouseDown = false;
            // Only reset lastTouchDistance when all touches are gone
            if (e.touches.length === 0) {
                lastTouchDistance = 0;
            } else if (e.touches.length === 1) {
                // If we go from 2 touches to 1, stop zooming but don't reset distance
                lastTouchDistance = 0;
            }
        });

        // Mouse wheel for zoom
        document.addEventListener('wheel', (e) => {
            if (this.canvasScreen.classList.contains('hidden')) return;
            
            // Only handle wheel events on the canvas area
            if (canvas3D() && canvas3D().contains(e.target)) {
                const delta = e.deltaY * 0.01;
                this.targetDistance = Math.max(2, Math.min(15, this.targetDistance + delta));
                e.preventDefault();
            }
        }, { passive: false });

        // Double tap to reset - only on canvas area
        let lastTap = 0;
        document.addEventListener('touchend', (e) => {
            if (this.canvasScreen.classList.contains('hidden')) return;
            
            if (canvas3D() && canvas3D().contains(e.target) && e.touches.length === 0) {
                const currentTime = new Date().getTime();
                const tapLength = currentTime - lastTap;
                if (tapLength < 500 && tapLength > 0) {
                    console.log('Double tap detected - resetting camera'); // Debug log
                    this.resetCamera();
                }
                lastTap = currentTime;
            }
        });
    }

    handleRotation(clientX, clientY) {
        const deltaMove = {
            x: clientX - this.previousMousePosition.x,
            y: clientY - this.previousMousePosition.y
        };

        this.targetRotation.y -= deltaMove.x * 0.01; // Inverted horizontal movement
        this.targetRotation.x += deltaMove.y * 0.01;
        
        // Clamp vertical rotation
        this.targetRotation.x = Math.max(-Math.PI/2, Math.min(Math.PI/2, this.targetRotation.x));

        this.previousMousePosition = { x: clientX, y: clientY };
    }

    handlePan(clientX, clientY) {
        const deltaMove = {
            x: clientX - this.previousMousePosition.x,
            y: clientY - this.previousMousePosition.y
        };

        // Calculate pan speed based on distance from camera
        const panSpeed = this.distance * 0.001;
        
        // Calculate right and up vectors in world space
        const right = new THREE.Vector3();
        const up = new THREE.Vector3();
        
        // Get camera's right vector (perpendicular to view direction)
        right.setFromMatrixColumn(this.camera.matrix, 0);
        right.normalize();
        
        // Get camera's up vector
        up.setFromMatrixColumn(this.camera.matrix, 1);
        up.normalize();
        
        // Calculate pan movement in world space
        const panX = right.multiplyScalar(-deltaMove.x * panSpeed);
        const panY = up.multiplyScalar(deltaMove.y * panSpeed); // Inverted Y movement
        
        // Move both camera position and point of interest
        this.camera.position.add(panX);
        this.camera.position.add(panY);
        this.pointOfInterest.add(panX);
        this.pointOfInterest.add(panY);
        
        this.previousMousePosition = { x: clientX, y: clientY };
    }

    updateCameraModeIndicator(mode) {
        if (this.cameraModeIndicator) {
            this.cameraModeIndicator.textContent = mode;
            if (mode === 'Pan Mode') {
                this.cameraModeIndicator.classList.add('panning');
            } else {
                this.cameraModeIndicator.classList.remove('panning');
            }
        }
    }

    resetCamera() {
        console.log('Camera reset triggered'); // Debug log
        this.targetRotation = { x: 0, y: 0 };
        this.targetDistance = 5;
        this.pointOfInterest.set(0, 0, 0); // Reset point of interest to origin
    }

    showCanvasScreen() {
        this.inputScreen.classList.add('hidden');
        this.canvasScreen.classList.remove('hidden');
        this.loading.style.display = 'block';
        
        setTimeout(() => {
            this.init3DScene();
        }, 100);
    }

    showInputScreen() {
        this.canvasScreen.classList.add('hidden');
        this.inputScreen.classList.remove('hidden');
        
        if (this.renderer) {
            this.canvasContainer.removeChild(this.renderer.domElement);
            this.renderer.dispose();
            this.renderer = null;
        }
        
        // Clean up meshes
        if (this.textMesh) {
            this.scene.remove(this.textMesh);
            this.textMesh = null;
        }
        if (this.backgroundMesh) {
            this.scene.remove(this.backgroundMesh);
            this.backgroundMesh = null;
        }
        
        // Reset foreground image state
        this.foregroundImage = null;
        this.entranceAnimation = null;
        const foregroundLabel = document.querySelector('label[for="foregroundInput"]');
        if (foregroundLabel) {
            foregroundLabel.classList.remove('has-file');
            foregroundLabel.querySelector('.file-label-text').textContent = 'Choose Foreground Image (Optional - replaces text)';
        }
        if (this.foregroundPreview) {
            this.foregroundPreview.innerHTML = '';
        }
        if (this.animationOptions) {
            this.animationOptions.style.display = 'none';
        }
        // Uncheck all radio buttons
        document.querySelectorAll('input[name="entranceAnimation"]').forEach(radio => {
            radio.checked = false;
        });
        
        // Update button state
        this.updateNextButtonState();
    }

    init3DScene() {
        const text = this.textInput.value.trim();
        
        console.log('Initializing 3D scene...');
        console.log('Text input:', text);
        console.log('Foreground image:', this.foregroundImage ? 'Yes' : 'No');
        console.log('Background image:', this.backgroundImage ? 'Yes' : 'No');
        
        // Scene setup
        this.scene = new THREE.Scene();
        
        // Camera setup
        this.camera = new THREE.PerspectiveCamera(
            75, 
            window.innerWidth / window.innerHeight, 
            0.1, 
            1000
        );
        
        // Camera starts inside the panorama sphere (radius 50)
        this.camera.position.set(0, 0, 10);
        
        // Renderer setup with maximum quality settings
        this.renderer = new THREE.WebGLRenderer({ 
            antialias: true,
            alpha: true,
            powerPreference: "high-performance",
            precision: "highp"
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 3)); // Support up to 3x pixel density
        this.renderer.setClearColor(0x000000);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 0.3; // Much darker exposure
        
        // Depth of field effect disabled for better performance
        // this.setupDepthOfField();
        
        this.canvasContainer.appendChild(this.renderer.domElement);

        // Create 360° panorama sphere with default black rock texture
        console.log('Creating panorama sphere...');
        this.createPanoramaSphere();
        
        // Create background first (behind foreground)
        if (this.backgroundImage) {
            this.createBackgroundPlane();
        }

        // Create foreground element (text or image)
        if (this.foregroundImage) {
            this.createForegroundImage();
        } else if (text) {
            this.create3DText(text);
        }
        
        // Lighting
        this.setupLighting();
        
        // Start animation
        console.log('Starting animation loop...');
        this.animate();
        
        // Hide loading
        this.loading.style.display = 'none';
        console.log('3D scene initialization complete');
        
        // Handle resize
        window.addEventListener('resize', () => this.onWindowResize());
    }

    create3DText(text) {
        // Use canvas-based 3D text as the primary method for reliability
        this.createCanvasText(text);
    }
    
    createCanvasText(text) {
        // Split text into lines and handle multi-line rendering
        const lines = text.split('\n').filter(line => line.trim().length > 0); // Remove empty lines
        
        // Ensure Montserrat font is loaded before rendering
        document.fonts.load('800 200px Montserrat').then(() => {
            this.renderTextToCanvas(text, lines);
        }).catch(() => {
            // Fallback if font loading fails
            console.warn('Montserrat font loading failed, using fallback');
            this.renderTextToCanvas(text, lines);
        });
    }

    renderTextToCanvas(text, lines) {
        // Create high-quality text using canvas with WebGL-safe dimensions
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        
        // Calculate canvas size based on number of lines
        const lineHeight = 220; // Space between lines
        const padding = 100; // Top and bottom padding
        canvas.width = 4096;
        canvas.height = Math.max(1024, (lines.length * lineHeight) + (padding * 2));
        
        // Clear background to transparent
        context.clearRect(0, 0, canvas.width, canvas.height);
        
        // Style the text with high quality settings - Montserrat ExtraBold, no shadow
        context.fillStyle = '#ffffff';
        // Use CSS font syntax with explicit weight and family
        context.font = '800 200px "Montserrat", "Arial Black", "Helvetica Neue", Arial, sans-serif';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.imageSmoothingEnabled = true;
        context.imageSmoothingQuality = 'high';
        
        // Reset any shadow properties to ensure no shadows
        context.shadowColor = 'transparent';
        context.shadowBlur = 0;
        context.shadowOffsetX = 0;
        context.shadowOffsetY = 0;
        
        // Draw each line of text (clean, no effects)
        const startY = padding + (lineHeight / 2);
        lines.forEach((line, index) => {
            const y = startY + (index * lineHeight);
            context.fillText(line.trim(), canvas.width / 2, y);
        });
        
        // Create texture from canvas with highest quality settings
        const texture = new THREE.CanvasTexture(canvas);
        texture.needsUpdate = true;
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.format = THREE.RGBAFormat;
        texture.generateMipmaps = false; // Disable mipmaps for sharpest quality
        texture.wrapS = THREE.ClampToEdgeWrap;
        texture.wrapT = THREE.ClampToEdgeWrap;
        
        // Keep geometry consistent - don't stretch based on line count
        const geometry = new THREE.BoxGeometry(6, 1.5, 0.4);
        
        // Create materials array - text only on front face, transparent elsewhere
        const materials = [
            new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 }), // Right side - invisible
            new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 }), // Left side - invisible  
            new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 }), // Top - invisible
            new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 }), // Bottom - invisible
            new THREE.MeshBasicMaterial({ // Front face - visible with text
                map: texture,
                transparent: true,
                alphaTest: 0.1
            }),
            new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 }) // Back - invisible
        ];
        
        // Create the mesh
        this.textMesh = new THREE.Mesh(geometry, materials);
        this.textMesh.castShadow = false;
        this.textMesh.receiveShadow = false;
        
        this.scene.add(this.textMesh);
        
        // Hide loading indicator
        this.loading.style.display = 'none';
    }

    createForegroundImage() {
        // Create a new image element to get dimensions
        const img = new Image();
        img.onload = () => {
            // Calculate aspect ratio from the actual image
            const aspectRatio = img.width / img.height;
            
            // Set a reasonable size for the foreground image
            const imageHeight = 3; // Adjust based on your needs
            const imageWidth = imageHeight * aspectRatio;
            
            // Create geometry with correct aspect ratio
            const geometry = new THREE.PlaneGeometry(imageWidth, imageHeight);
            
            // Create a plane for the foreground image
            const loader = new THREE.TextureLoader();
            
            // Load the foreground image with high quality settings
            const texture = loader.load(this.foregroundImage, (loadedTexture) => {
                // Apply high-quality texture settings
                loadedTexture.minFilter = THREE.LinearFilter;
                loadedTexture.magFilter = THREE.LinearFilter;
                loadedTexture.format = THREE.RGBAFormat; // Use RGBA to support transparency
                loadedTexture.generateMipmaps = false; // Disable for maximum sharpness
                loadedTexture.wrapS = THREE.ClampToEdgeWrap;
                loadedTexture.wrapT = THREE.ClampToEdgeWrap;
                loadedTexture.premultiplyAlpha = false; // Important: don't premultiply alpha
            });
            
            // Create material
            const material = new THREE.MeshBasicMaterial({
                map: texture,
                transparent: true,
                alphaTest: 0.1,
                premultipliedAlpha: false // Important: don't use premultiplied alpha
            });
            
            // Create the mesh
            this.textMesh = new THREE.Mesh(geometry, material);
            this.textMesh.castShadow = false;
            this.textMesh.receiveShadow = false;
            
            // Set initial position for entrance animation
            if (this.entranceAnimation) {
                this.setEntranceStartPosition();
            }
            
            this.scene.add(this.textMesh);
            
            // Hide loading indicator
            this.loading.style.display = 'none';
        };
        
        // Set the image source to trigger the onload
        img.src = this.foregroundImage;
    }

    setEntranceStartPosition() {
        if (!this.textMesh || !this.entranceAnimation) return;
        
        const distance = 25; // How far to start from - increased for more dramatic effect
        
        switch (this.entranceAnimation) {
            case 'fromTop':
                this.textMesh.position.set(0, distance, 0);
                break;
            case 'fromBottom':
                this.textMesh.position.set(0, -distance, 0);
                break;
            case 'fromLeft':
                this.textMesh.position.set(-distance, 0, 0);
                break;
            case 'fromRight':
                this.textMesh.position.set(distance, 0, 0);
                break;
        }
    }

    startEntranceAnimation() {
        if (!this.entranceAnimation) return;
        
        this.isEntranceAnimating = true;
        this.entranceStartTime = performance.now();
        console.log('Entrance animation started:', this.entranceAnimation);
    }

    updateEntranceAnimation() {
        if (!this.isEntranceAnimating || !this.textMesh) return;

        const currentTime = performance.now();
        const elapsed = currentTime - this.entranceStartTime;
        const progress = Math.min(elapsed / this.entranceDuration, 1);

        // Linear start with very strong ease-out at the end
        const easeOut = (t) => 1 - Math.pow(1 - t, 10); // 10th power ease-out
        const easedProgress = easeOut(progress);

        // Calculate target position (center)
        const targetX = 0;
        const targetY = 0;
        const targetZ = 0;

        // Get start position based on animation type
        let startX = 0, startY = 0, startZ = 0;
        const distance = 25; // Increased distance for more dramatic effect
        
        switch (this.entranceAnimation) {
            case 'fromTop':
                startY = distance;
                break;
            case 'fromBottom':
                startY = -distance;
                break;
            case 'fromLeft':
                startX = -distance;
                break;
            case 'fromRight':
                startX = distance;
                break;
        }

        // Interpolate position
        this.textMesh.position.x = startX + (targetX - startX) * easedProgress;
        this.textMesh.position.y = startY + (targetY - startY) * easedProgress;
        this.textMesh.position.z = startZ + (targetZ - startZ) * easedProgress;

        // Check if entrance animation is complete
        if (progress >= 1) {
            this.isEntranceAnimating = false;
            console.log('Entrance animation completed');
        }
    }

    // Keyframe and Animation System
    setKeyframe(type) {
        const currentKeyframe = {
            rotation: { ...this.rotation },
            distance: this.distance,
            pointOfInterest: this.pointOfInterest.clone()
        };

        this.keyframes[type] = currentKeyframe;

        if (type === 'start') {
            this.setStartBtn.classList.add('set');
            this.setStartBtn.textContent = '✓ Start';
            this.setEndBtn.disabled = false;
            this.keyframeStatus.textContent = 'Start keyframe set! Now position camera for end keyframe';
        } else if (type === 'end') {
            this.setEndBtn.classList.add('set');
            this.setEndBtn.textContent = '✓ End';
            this.playBtn.disabled = false;
            this.renderBtn.disabled = false;
            this.keyframeStatus.textContent = 'Both keyframes set! Ready to play or render animation';
        }

        console.log(`${type} keyframe set:`, currentKeyframe);
    }

    playAnimation() {
        if (!this.keyframes.start || !this.keyframes.end) {
            return;
        }

        this.isAnimating = true;
        this.animationStartTime = performance.now();
        
        // Start entrance animation if enabled
        if (this.entranceAnimation && this.textMesh) {
            this.startEntranceAnimation();
        }
        
        // Disable controls during animation
        this.setStartBtn.disabled = true;
        this.setEndBtn.disabled = true;
        this.playBtn.disabled = true;
        this.renderBtn.disabled = true;
        this.playBtn.textContent = 'Playing...';
        this.keyframeStatus.textContent = 'Animation playing (7 seconds)';

        console.log('Animation started');
    }

    updateAnimation() {
        if (!this.isAnimating) return;

        const currentTime = performance.now();
        const elapsed = currentTime - this.animationStartTime;
        const progress = Math.min(elapsed / this.animationDuration, 1);

        // Smooth easing function (ease-in-out)
        const easeInOut = (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
        const easedProgress = easeInOut(progress);

        // Interpolate between start and end keyframes
        const start = this.keyframes.start;
        const end = this.keyframes.end;

        // Interpolate rotation
        this.rotation.x = start.rotation.x + (end.rotation.x - start.rotation.x) * easedProgress;
        this.rotation.y = start.rotation.y + (end.rotation.y - start.rotation.y) * easedProgress;
        
        // Interpolate distance
        this.distance = start.distance + (end.distance - start.distance) * easedProgress;
        
        // Interpolate point of interest
        this.pointOfInterest.lerpVectors(start.pointOfInterest, end.pointOfInterest, easedProgress);

        // Update targets to match animation
        this.targetRotation.x = this.rotation.x;
        this.targetRotation.y = this.rotation.y;
        this.targetDistance = this.distance;

        // Check if animation is complete
        if (progress >= 1) {
            this.isAnimating = false;
            
            // Handle recording completion
            if (this.isRecording) {
                this.stopRecording();
                return;
            }
            
            // Re-enable controls
            this.setStartBtn.disabled = false;
            this.setEndBtn.disabled = false;
            this.playBtn.disabled = false;
            this.renderBtn.disabled = false;
            this.playBtn.textContent = '▶ Play (7s)';
            this.keyframeStatus.textContent = 'Animation complete! Adjust camera or replay';
            
            console.log('Animation completed');
        }
    }

    // Video Recording System
    startRender() {
        if (!this.keyframes.start || !this.keyframes.end) {
            return;
        }

        try {
            // Get canvas stream for recording
            const stream = this.renderer.domElement.captureStream(30); // 30 FPS
            
            // Configure MediaRecorder
            const options = {
                mimeType: 'video/webm;codecs=vp9',
                videoBitsPerSecond: 5000000 // 5 Mbps for high quality
            };
            
            // Fallback for browsers that don't support vp9
            if (!MediaRecorder.isTypeSupported(options.mimeType)) {
                options.mimeType = 'video/webm';
            }
            
            this.mediaRecorder = new MediaRecorder(stream, options);
            this.recordedChunks = [];
            
            // Handle recorded data
            this.mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    this.recordedChunks.push(event.data);
                }
            };
            
            // Handle recording completion
            this.mediaRecorder.onstop = () => {
                this.processRecording();
            };
            
            // Start recording
            this.mediaRecorder.start();
            this.isRecording = true;
            
            // Update UI
            this.setStartBtn.disabled = true;
            this.setEndBtn.disabled = true;
            this.playBtn.disabled = true;
            this.renderBtn.disabled = true;
            this.renderBtn.textContent = '🔴 Recording...';
            this.keyframeStatus.textContent = 'Recording MP4... (7 seconds)';
            
            // Start animation for recording
            this.playAnimation();
            
        } catch (error) {
            console.error('Recording failed:', error);
            this.keyframeStatus.textContent = 'Recording failed. Try again.';
            this.isRecording = false;
        }
    }

    stopRecording() {
        if (this.mediaRecorder && this.isRecording) {
            this.mediaRecorder.stop();
            this.isRecording = false;
        }
    }

    processRecording() {
        // Create blob from recorded chunks
        const blob = new Blob(this.recordedChunks, { type: 'video/webm' });
        this.currentVideoBlob = blob;
        
        // Create video URL and show in modal
        const videoURL = URL.createObjectURL(blob);
        this.renderedVideo.src = videoURL;
        
        // Show video modal
        this.showVideoModal();
        
        // Clean up recorded chunks
        this.recordedChunks = [];
        
        // Re-enable controls
        this.setStartBtn.disabled = false;
        this.setEndBtn.disabled = false;
        this.playBtn.disabled = false;
        this.renderBtn.disabled = false;
        this.renderBtn.textContent = '🎥 Render Video';
        this.keyframeStatus.textContent = 'Video ready! Long-press to save to camera roll';
        
        console.log('Recording processed and ready for viewing');
    }

    // Video Modal Management
    showVideoModal() {
        this.videoModal.classList.add('show');
        // Auto-play the video
        setTimeout(() => {
            this.renderedVideo.play().catch(e => console.log('Autoplay prevented:', e));
        }, 100);
    }

    closeVideoModal() {
        this.videoModal.classList.remove('show');
        // Clean up video URL to free memory
        if (this.renderedVideo.src) {
            URL.revokeObjectURL(this.renderedVideo.src);
            this.renderedVideo.src = '';
        }
    }

    downloadVideo() {
        if (this.currentVideoBlob) {
            // Create download link as fallback
            const url = URL.createObjectURL(this.currentVideoBlob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `3d-text-animation-${Date.now()}.webm`;
            
            // Trigger download
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            
            // Clean up
            URL.revokeObjectURL(url);
            
            console.log('Video downloaded as fallback');
        }
    }

    createBackgroundPlane() {
        // Create a new image element to get dimensions
        const img = new Image();
        img.onload = () => {
            // Calculate aspect ratio from the actual image
            const aspectRatio = img.width / img.height;
            
            // Set a larger height and calculate width based on aspect ratio
            const planeHeight = 20; // Much larger scale
            const planeWidth = planeHeight * aspectRatio;
            
            // Create geometry with correct aspect ratio
            const geometry = new THREE.PlaneGeometry(planeWidth, planeHeight);
            
            // Create a large plane for the background image
            const loader = new THREE.TextureLoader();
            
            // Load the background image with high quality settings
            const texture = loader.load(this.backgroundImage, (loadedTexture) => {
                // Apply high-quality texture settings
                loadedTexture.minFilter = THREE.LinearFilter;
                loadedTexture.magFilter = THREE.LinearFilter;
                loadedTexture.format = THREE.RGBAFormat; // Use RGBA to support transparency
                loadedTexture.generateMipmaps = false; // Disable for maximum sharpness
                loadedTexture.wrapS = THREE.ClampToEdgeWrap;
                loadedTexture.wrapT = THREE.ClampToEdgeWrap;
                loadedTexture.premultiplyAlpha = false; // Important: don't premultiply alpha
            });
            
            // Create material
            const material = new THREE.MeshBasicMaterial({
                map: texture,
                transparent: false
            });
            
            // Create the mesh
            this.backgroundMesh = new THREE.Mesh(geometry, material);
            
            // Position it closer behind the text (reduced Z distance)
            this.backgroundMesh.position.z = -1.5;
            
            this.scene.add(this.backgroundMesh);
            
            // Also update the panorama sphere with the same texture
            this.updatePanoramaTexture(this.backgroundImage);
        };
        
        // Set the image source to trigger the onload
        img.src = this.backgroundImage;
    }

    createPanoramaSphere() {
        // Create a massive sphere for 360° panorama
        const sphereGeometry = new THREE.SphereGeometry(50, 64, 64); // Large radius, high detail
        
        // Load the default black rock texture with error handling
        const textureLoader = new THREE.TextureLoader();
        console.log('Attempting to load texture: assets/BlackRockTexture3.jpg');
        
        const texture = textureLoader.load(
            'assets/BlackRockTexture3.jpg', 
            (loadedTexture) => {
                console.log('Texture loaded successfully, applying settings...');
                // Apply basic texture settings (avoiding problematic parameters)
                loadedTexture.minFilter = THREE.LinearFilter;
                loadedTexture.magFilter = THREE.LinearFilter;
                loadedTexture.wrapS = THREE.ClampToEdgeWrap;
                loadedTexture.wrapT = THREE.ClampToEdgeWrap;
                loadedTexture.needsUpdate = true;
                console.log('Panorama texture loaded successfully');
            },
            (progress) => {
                console.log('Texture loading progress:', progress);
            },
            (error) => {
                console.error('Failed to load panorama texture:', error);
                console.error('Error details:', error.target);
                // Fallback to a simple color material if texture fails
                this.createFallbackPanorama();
            }
        );
        
        // Create material with texture applied to inside of sphere
        const material = new THREE.MeshBasicMaterial({
            map: texture,
            side: THREE.BackSide // Render on inside of sphere
        });
        
        // Create the sphere mesh
        this.panoramaSphere = new THREE.Mesh(sphereGeometry, material);
        
        // Position at origin (camera will be inside)
        this.panoramaSphere.position.set(0, 0, 0);
        
        // Rotate sphere 90 degrees to the right to hide the stitch line
        this.panoramaSphere.rotation.y = Math.PI / 2; // 90 degrees in radians
        
        this.scene.add(this.panoramaSphere);
        
        // Store reference to material for texture updates
        this.panoramaMaterial = material;
        
        console.log('Panorama sphere created and added to scene');
        console.log('Sphere radius: 50, segments: 64x64');
        console.log('Camera position:', this.camera.position);
        console.log('Scene children count:', this.scene.children.length);
    }

    createFallbackPanorama() {
        // Create a fallback sphere with a simple dark color if texture fails
        const sphereGeometry = new THREE.SphereGeometry(50, 64, 64);
        const material = new THREE.MeshBasicMaterial({
            color: 0x1a1a1a, // Dark gray color
            side: THREE.BackSide
        });
        
        this.panoramaSphere = new THREE.Mesh(sphereGeometry, material);
        this.panoramaSphere.position.set(0, 0, 0);
        this.scene.add(this.panoramaSphere);
        this.panoramaMaterial = material;
        
        console.log('Created fallback panorama sphere');
    }

    updatePanoramaTexture(imageUrl) {
        if (this.panoramaMaterial) {
            const textureLoader = new THREE.TextureLoader();
            const newTexture = textureLoader.load(imageUrl, (loadedTexture) => {
                // Apply high-quality texture settings
                loadedTexture.minFilter = THREE.LinearFilter;
                loadedTexture.magFilter = THREE.LinearFilter;
                loadedTexture.wrapS = THREE.RepeatWrapping;
                loadedTexture.wrapT = THREE.RepeatWrapping;
                loadedTexture.repeat.set(2, 1); // Repeat horizontally for better coverage
                
                // Update the material's texture
                this.panoramaMaterial.map = newTexture;
                this.panoramaMaterial.needsUpdate = true;
            });
        }
    }

    setupLighting() {
        // Ambient light - increased brightness
        const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
        this.scene.add(ambientLight);

        // Main directional light - increased brightness
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(5, 5, 5);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        this.scene.add(directionalLight);

        // Fill light - increased brightness
        const fillLight = new THREE.DirectionalLight(0x4a90e2, 0.4);
        fillLight.position.set(-5, 0, 2);
        this.scene.add(fillLight);

        // Rim light - increased brightness
        const rimLight = new THREE.DirectionalLight(0xffffff, 0.6);
        rimLight.position.set(0, 5, -5);
        this.scene.add(rimLight);
    }

    setupDepthOfField() {
        // Simple and reliable depth of field without depth buffer issues
        this.postScene = new THREE.Scene();
        this.postCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
        
        // Create render target without depth buffer to avoid issues
        this.renderTarget = new THREE.WebGLRenderTarget(
            window.innerWidth,
            window.innerHeight,
            {
                minFilter: THREE.LinearFilter,
                magFilter: THREE.LinearFilter,
                format: THREE.RGBAFormat,
                encoding: THREE.sRGBEncoding
            }
        );
        
        // Simple depth of field material
        this.dofMaterial = new THREE.ShaderMaterial({
            uniforms: {
                tDiffuse: { value: null },
                focusDistance: { value: 5.0 },
                focusRange: { value: 2.0 },
                bokehScale: { value: 1.5 }
            },
            vertexShader: `
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform sampler2D tDiffuse;
                uniform float focusDistance;
                uniform float focusRange;
                uniform float bokehScale;
                varying vec2 vUv;
                
                void main() {
                    vec4 color = texture2D(tDiffuse, vUv);
                    
                    // Create distance-based blur using screen position
                    vec2 center = vec2(0.5, 0.5);
                    float screenDistance = length(vUv - center);
                    
                    // Calculate blur based on screen distance
                    float blurFactor = smoothstep(0.0, 0.7, screenDistance);
                    float blur = blurFactor * bokehScale * 0.02;
                    
                    // Apply blur with quality
                    if (blur > 0.001) {
                        vec4 blurred = vec4(0.0);
                        float totalWeight = 0.0;
                        
                        // 5x5 blur for quality
                        for(int i = -2; i <= 2; i++) {
                            for(int j = -2; j <= 2; j++) {
                                vec2 offset = vec2(float(i), float(j)) * blur;
                                vec4 sampleColor = texture2D(tDiffuse, vUv + offset);
                                float weight = 1.0 / (1.0 + float(i*i + j*j));
                                blurred += sampleColor * weight;
                                totalWeight += weight;
                            }
                        }
                        gl_FragColor = mix(color, blurred / totalWeight, blurFactor);
                    } else {
                        gl_FragColor = color;
                    }
                }
            `
        });
        
        // Create full-screen quad
        const geometry = new THREE.PlaneGeometry(2, 2);
        this.postQuad = new THREE.Mesh(geometry, this.dofMaterial);
        this.postScene.add(this.postQuad);
    }

    renderWithDepthOfField() {
        // Render scene to render target
        this.renderer.setRenderTarget(this.renderTarget);
        this.renderer.render(this.scene, this.camera);
        
        // Update post-processing uniforms
        this.dofMaterial.uniforms.tDiffuse.value = this.renderTarget.texture;
        
        // Render post-processing to screen
        this.renderer.setRenderTarget(null);
        this.renderer.render(this.postScene, this.postCamera);
    }

    animate() {
        if (!this.renderer) return;
        
        requestAnimationFrame(() => this.animate());

        // Update animation if playing
        this.updateAnimation();
        
        // Update entrance animation
        this.updateEntranceAnimation();

        // Only apply smooth camera movement if not animating
        if (!this.isAnimating) {
            // Smooth camera movement
            this.rotation.x += (this.targetRotation.x - this.rotation.x) * 0.1;
            this.rotation.y += (this.targetRotation.y - this.rotation.y) * 0.1;
            this.distance += (this.targetDistance - this.distance) * 0.1;
        }

        // Update camera position based on rotation and distance, relative to point of interest
        this.camera.position.x = this.pointOfInterest.x + Math.sin(this.rotation.y) * Math.cos(this.rotation.x) * this.distance;
        this.camera.position.y = this.pointOfInterest.y + Math.sin(this.rotation.x) * this.distance;
        this.camera.position.z = this.pointOfInterest.z + Math.cos(this.rotation.y) * Math.cos(this.rotation.x) * this.distance;
        
        this.camera.lookAt(this.pointOfInterest);

        // Render scene directly (DOF disabled)
        this.renderer.render(this.scene, this.camera);
    }

    onWindowResize() {
        if (!this.camera || !this.renderer) return;
        
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 3)); // Maintain high pixel ratio on resize
        
        // DOF render target removed (DOF disabled)
        // if (this.renderTarget) {
        //     this.renderTarget.setSize(window.innerWidth, window.innerHeight);
        // }
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new TextGenerator3D();
});

// Service Worker for PWA functionality
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered successfully:', registration);
            })
            .catch(error => {
                console.log('SW registration failed:', error);
            });
    });
} 