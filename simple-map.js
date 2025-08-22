/**
 * Simple Map Implementation - Fallback for when external map libraries are not available
 * Provides basic 2D visualization of GPS coordinates
 */

class SimpleMap {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.svg = document.getElementById('mapSvg');
        this.width = 0;
        this.height = 0;
        this.markers = [];
        this.tracks = [];
        this.bounds = { minLat: null, maxLat: null, minLng: null, maxLng: null };
        this.zoom = 1;
        this.centerLat = 0;
        this.centerLng = 0;
        this.padding = 50;
        
        this.init();
    }
    
    init() {
        this.updateDimensions();
        window.addEventListener('resize', () => this.updateDimensions());
    }
    
    updateDimensions() {
        if (this.container) {
            this.width = this.container.clientWidth;
            this.height = this.container.clientHeight;
            this.svg.setAttribute('width', this.width);
            this.svg.setAttribute('height', this.height);
        }
    }
    
    addMarker(lat, lng, options = {}) {
        const marker = {
            lat: lat,
            lng: lng,
            id: options.id || Date.now(),
            className: options.className || 'map-marker',
            title: options.title || '',
            onClick: options.onClick || null
        };
        
        this.markers.push(marker);
        this.updateBounds(lat, lng);
        this.render();
        
        return marker;
    }
    
    removeMarker(markerId) {
        this.markers = this.markers.filter(m => m.id !== markerId);
        this.render();
    }
    
    addTrack(coordinates, options = {}) {
        const track = {
            coordinates: coordinates, // Array of [lat, lng] pairs
            id: options.id || Date.now(),
            color: options.color || '#e74c3c',
            width: options.width || 3
        };
        
        this.tracks.push(track);
        
        // Update bounds for all coordinates
        coordinates.forEach(([lat, lng]) => {
            this.updateBounds(lat, lng);
        });
        
        this.render();
        return track;
    }
    
    removeTrack(trackId) {
        this.tracks = this.tracks.filter(t => t.id !== trackId);
        this.render();
    }
    
    updateBounds(lat, lng) {
        if (this.bounds.minLat === null) {
            this.bounds.minLat = this.bounds.maxLat = lat;
            this.bounds.minLng = this.bounds.maxLng = lng;
        } else {
            this.bounds.minLat = Math.min(this.bounds.minLat, lat);
            this.bounds.maxLat = Math.max(this.bounds.maxLat, lat);
            this.bounds.minLng = Math.min(this.bounds.minLng, lng);
            this.bounds.maxLng = Math.max(this.bounds.maxLng, lng);
        }
        
        this.centerLat = (this.bounds.minLat + this.bounds.maxLat) / 2;
        this.centerLng = (this.bounds.minLng + this.bounds.maxLng) / 2;
    }
    
    latLngToPixel(lat, lng) {
        if (this.bounds.minLat === null) return { x: 0, y: 0 };
        
        const latRange = this.bounds.maxLat - this.bounds.minLat;
        const lngRange = this.bounds.maxLng - this.bounds.minLng;
        
        // Add minimum range to avoid division by zero
        const effectiveLatRange = Math.max(latRange, 0.001);
        const effectiveLngRange = Math.max(lngRange, 0.001);
        
        const x = ((lng - this.bounds.minLng) / effectiveLngRange) * (this.width - 2 * this.padding) + this.padding;
        const y = ((this.bounds.maxLat - lat) / effectiveLatRange) * (this.height - 2 * this.padding) + this.padding;
        
        return { x: x * this.zoom, y: y * this.zoom };
    }
    
    render() {
        this.updateDimensions();
        this.svg.innerHTML = '';
        
        // Render tracks first (so they appear under markers)
        this.tracks.forEach(track => {
            this.renderTrack(track);
        });
        
        // Render markers
        this.markers.forEach(marker => {
            this.renderMarker(marker);
        });
        
        // Hide loading indicator
        const loading = this.container.querySelector('.loading');
        if (loading) {
            loading.style.display = 'none';
        }
    }
    
    renderMarker(marker) {
        const pos = this.latLngToPixel(marker.lat, marker.lng);
        
        // Create marker element
        const markerEl = document.createElement('div');
        markerEl.className = marker.className;
        markerEl.style.left = pos.x + 'px';
        markerEl.style.top = pos.y + 'px';
        markerEl.title = marker.title;
        
        if (marker.onClick) {
            markerEl.addEventListener('click', marker.onClick);
        }
        
        this.container.appendChild(markerEl);
    }
    
    renderTrack(track) {
        if (track.coordinates.length < 2) return;
        
        // Create SVG path for the track
        let pathData = '';
        track.coordinates.forEach(([lat, lng], index) => {
            const pos = this.latLngToPixel(lat, lng);
            pathData += (index === 0 ? `M ${pos.x} ${pos.y}` : ` L ${pos.x} ${pos.y}`);
        });
        
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', pathData);
        path.setAttribute('stroke', track.color);
        path.setAttribute('stroke-width', track.width);
        path.setAttribute('fill', 'none');
        path.setAttribute('stroke-opacity', '0.8');
        
        this.svg.appendChild(path);
    }
    
    fitBounds() {
        if (this.bounds.minLat === null) return;
        
        // Auto-zoom to fit all markers and tracks
        const latRange = this.bounds.maxLat - this.bounds.minLat;
        const lngRange = this.bounds.maxLng - this.bounds.minLng;
        
        if (latRange === 0 && lngRange === 0) {
            this.zoom = 1;
        } else {
            const latZoom = (this.height - 2 * this.padding) / (latRange * 111000); // rough meters per degree
            const lngZoom = (this.width - 2 * this.padding) / (lngRange * 111000 * Math.cos(this.centerLat * Math.PI / 180));
            this.zoom = Math.min(latZoom, lngZoom, 5); // Cap zoom level
        }
        
        this.render();
    }
    
    setView(lat, lng, zoom = null) {
        this.centerLat = lat;
        this.centerLng = lng;
        if (zoom !== null) {
            this.zoom = zoom;
        }
        
        // Update bounds to center on this location
        const offset = 0.001; // Small offset for bounds
        this.bounds = {
            minLat: lat - offset,
            maxLat: lat + offset,
            minLng: lng - offset,
            maxLng: lng + offset
        };
        
        this.render();
    }
    
    zoomIn() {
        this.zoom = Math.min(this.zoom * 1.5, 10);
        this.render();
    }
    
    zoomOut() {
        this.zoom = Math.max(this.zoom / 1.5, 0.1);
        this.render();
    }
}

// Export for use in other modules
window.SimpleMap = SimpleMap;