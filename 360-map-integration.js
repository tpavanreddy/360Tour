/**
 * 360° Tour with 2D Map Integration
 * Provides GPX track loading, real-time location tracking, and orientation display
 */

class Tour360MapIntegration {
    constructor() {
        this.map = null;
        this.currentLocationMarker = null;
        this.orientationIndicator = null;
        this.gpxTrack = null;
        this.tourData = [];
        this.currentSceneIndex = 0;
        this.autoFollow = false;
        this.krpano = null;
        
        this.init();
    }
    
    async init() {
        await this.initMap();
        await this.loadTourData();
        this.initKrpanoIntegration();
        this.initControls();
        this.updateCurrentLocation();
    }
    
    async initMap() {
        // Initialize Simple Map (fallback implementation)
        this.map = new SimpleMap('map');
        console.log('Simple map initialized');
    }
    
    createCustomIcons() {
        // Icons are handled by CSS classes in simple map implementation
        console.log('Using CSS-based markers for simple map');
    }
    
    async loadTourData() {
        try {
            // Parse tour.xml to extract scene data
            const response = await fetch('tour.xml');
            const xmlText = await response.text();
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
            
            const scenes = xmlDoc.querySelectorAll('scene');
            this.tourData = Array.from(scenes).map((scene, index) => {
                return {
                    name: scene.getAttribute('name'),
                    title: scene.getAttribute('title'),
                    lat: parseFloat(scene.getAttribute('lat')),
                    lng: parseFloat(scene.getAttribute('lng')),
                    alt: parseFloat(scene.getAttribute('alt')),
                    heading: parseFloat(scene.getAttribute('heading')) || 0,
                    index: index
                };
            }).filter(scene => !isNaN(scene.lat) && !isNaN(scene.lng));
            
            this.addSceneMarkersToMap();
            
        } catch (error) {
            console.error('Error loading tour data:', error);
        }
    }
    
    addSceneMarkersToMap() {
        this.tourData.forEach((scene, index) => {
            const marker = this.map.addMarker(scene.lat, scene.lng, {
                id: `scene-${index}`,
                className: 'map-marker',
                title: `${scene.title}\nLat: ${scene.lat.toFixed(6)}\nLng: ${scene.lng.toFixed(6)}\nAlt: ${scene.alt}m`,
                onClick: () => this.loadScene(index)
            });
        });
        
        // Fit map to show all scenes
        if (this.tourData.length > 0) {
            setTimeout(() => this.map.fitBounds(), 100);
        }
    }
    
    initKrpanoIntegration() {
        // Wait for krpano to be ready
        const waitForKrpano = () => {
            if (typeof krpano !== 'undefined' && krpano.get) {
                this.krpano = krpano;
                this.setupKrpanoCallbacks();
            } else {
                setTimeout(waitForKrpano, 100);
            }
        };
        waitForKrpano();
    }
    
    setupKrpanoCallbacks() {
        // Listen for scene changes
        this.krpano.set('events[tour360_scenechange].keep', true);
        this.krpano.set('events[tour360_scenechange].onloadcomplete', () => {
            this.onSceneChange();
        });
        
        // Listen for view changes (orientation)
        this.krpano.set('events[tour360_viewchange].keep', true);
        this.krpano.set('events[tour360_viewchange].onviewchange', () => {
            this.onViewChange();
        });
    }
    
    onSceneChange() {
        const currentScene = this.krpano.get('xml.scene');
        if (currentScene) {
            const sceneIndex = this.tourData.findIndex(scene => scene.name === currentScene);
            if (sceneIndex !== -1) {
                this.currentSceneIndex = sceneIndex;
                this.updateCurrentLocation();
                
                if (this.autoFollow) {
                    const scene = this.tourData[sceneIndex];
                    this.map.setView(scene.lat, scene.lng);
                }
            }
        }
    }
    
    onViewChange() {
        if (this.krpano) {
            const hlookat = this.krpano.get('view.hlookat') || 0;
            this.updateOrientation(hlookat);
        }
    }
    
    updateCurrentLocation() {
        if (this.currentSceneIndex >= 0 && this.currentSceneIndex < this.tourData.length) {
            const scene = this.tourData[this.currentSceneIndex];
            
            // Remove previous current location marker
            if (this.currentLocationMarker) {
                this.map.removeMarker(this.currentLocationMarker.id);
            }
            
            // Add new current location marker
            this.currentLocationMarker = this.map.addMarker(scene.lat, scene.lng, {
                id: 'current-location',
                className: 'map-marker current-marker',
                title: `Current: ${scene.title}`
            });
            
            // Update info panel
            document.getElementById('currentLocation').textContent = 
                `${scene.lat.toFixed(6)}, ${scene.lng.toFixed(6)}`;
            document.getElementById('currentElevation').textContent = 
                `Elevation: ${scene.alt}m`;
                
            this.updateOrientation(scene.heading);
        }
    }
    
    updateOrientation(heading) {
        // Update orientation display in simple map
        // (Visual orientation indicator would require more complex implementation)
        
        // Update info panel
        const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
        const directionIndex = Math.round(((heading % 360) + 360) % 360 / 45) % 8;
        document.getElementById('currentOrientation').textContent = 
            `Orientation: ${directions[directionIndex]} (${Math.round(heading)}°)`;
    }
    
    loadScene(sceneIndex) {
        if (sceneIndex >= 0 && sceneIndex < this.tourData.length && this.krpano) {
            const scene = this.tourData[sceneIndex];
            this.krpano.call(`loadscene(${scene.name}, null, MERGE);`);
        }
    }
    
    initControls() {
        // GPX file upload
        document.getElementById('gpxFile').addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                this.loadGPXFile(file);
            }
        });
        
        // Media type switching
        document.getElementById('mediaType').addEventListener('change', (e) => {
            this.switchMediaType(e.target.value);
        });
    }
    
    async loadGPXFile(file) {
        try {
            const text = await file.text();
            const parser = new DOMParser();
            const gpxDoc = parser.parseFromString(text, 'text/xml');
            
            // Parse GPX track points
            const trackPoints = gpxDoc.querySelectorAll('trkpt');
            const coordinates = Array.from(trackPoints).map(point => [
                parseFloat(point.getAttribute('lat')),
                parseFloat(point.getAttribute('lon'))
            ]);
            
            if (coordinates.length > 0) {
                // Remove existing GPX track
                if (this.gpxTrack) {
                    this.map.removeTrack(this.gpxTrack.id);
                }
                
                // Add new GPX track
                this.gpxTrack = this.map.addTrack(coordinates, {
                    id: 'gpx-track',
                    color: '#e74c3c',
                    width: 3
                });
                
                // Fit map to GPX track
                setTimeout(() => this.map.fitBounds(), 100);
                
                console.log(`Loaded GPX track with ${coordinates.length} points`);
            }
            
        } catch (error) {
            console.error('Error loading GPX file:', error);
            alert('Error loading GPX file. Please check the file format.');
        }
    }
    
    loadSampleGPX() {
        // Create a sample GPX track around the tour area
        const sampleCoordinates = this.tourData.map(scene => [scene.lat, scene.lng]);
        
        if (sampleCoordinates.length > 0) {
            if (this.gpxTrack) {
                this.map.removeTrack(this.gpxTrack.id);
            }
            
            this.gpxTrack = this.map.addTrack(sampleCoordinates, {
                id: 'sample-track',
                color: '#f39c12',
                width: 3
            });
            
            setTimeout(() => this.map.fitBounds(), 100);
            console.log('Loaded sample GPX track based on tour scenes');
        }
    }
    
    switchMediaType(type) {
        console.log(`Switching to ${type} mode`);
        // This would integrate with video player plugin for 360° videos
        // For now, just log the change
        
        if (type === 'video' && this.krpano) {
            // Enable video player functionality
            // This would require additional video files and player setup
            console.log('Video mode activated - would load 360° videos');
        }
    }
    
    toggleAutoFollow() {
        this.autoFollow = !this.autoFollow;
        const button = event.target;
        button.textContent = this.autoFollow ? 'Stop Follow' : 'Auto Follow';
        button.style.background = this.autoFollow ? '#e74c3c' : '#3498db';
        
        if (this.autoFollow) {
            this.centerOnCurrentLocation();
        }
    }
    
    centerOnCurrentLocation() {
        if (this.currentSceneIndex >= 0 && this.currentSceneIndex < this.tourData.length) {
            const scene = this.tourData[this.currentSceneIndex];
            this.map.setView(scene.lat, scene.lng, 2);
        }
    }
    
    zoomIn() {
        this.map.zoomIn();
    }
    
    zoomOut() {
        this.map.zoomOut();
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.tour360 = new Tour360MapIntegration();
});

// Global functions for button clicks
window.loadSampleGPX = () => window.tour360?.loadSampleGPX();
window.toggleAutoFollow = () => window.tour360?.toggleAutoFollow();
window.centerOnCurrentLocation = () => window.tour360?.centerOnCurrentLocation();