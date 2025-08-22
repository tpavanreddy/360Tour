# 360Tour with 2D Map Integration

A comprehensive 360° panoramic tour viewer with integrated 2D map navigation and GPX track support. Perfect for showcasing 360° camera content (like Insta360) with geographical context.

## Features

### 🌍 Dual View Experience
- **360° Panoramic Viewer**: Full krpano-powered immersive experience
- **Interactive 2D Map**: Real-time location tracking with Leaflet.js
- **Responsive Layout**: Works on desktop and mobile devices

### 📍 Location & Navigation
- **GPS Coordinate Display**: Real-time lat/lng/elevation information
- **Orientation Indicator**: Visual compass showing camera direction
- **Auto-Follow Mode**: Map automatically centers on current location
- **Scene Markers**: Click-to-navigate between panoramic locations

### 🗺️ GPX Track Support
- **GPX File Upload**: Load and display GPS tracks on the map
- **Sample Track**: Built-in demo track for testing
- **Track Visualization**: Colored polylines showing movement paths
- **Elevation Data**: Support for altitude information

### 🎥 Media Support
- **360° Images**: Full panoramic image support (current)
- **360° Video**: Framework ready for 360° video integration
- **Media Switching**: Toggle between image and video modes

## Usage

### Basic Setup
1. Open `tour.html` in a web browser
2. The 360° viewer loads on the left, 2D map on the right
3. Navigate through scenes using thumbnails or map markers

### Loading GPX Tracks
1. **Upload GPX File**: Use the file input to load your own GPX tracks
2. **Sample Track**: Click "Load Sample Track" to see a demo
3. **Track Display**: GPX tracks appear as colored lines on the map

### Navigation Controls
- **Auto Follow**: Toggle to keep map centered on current location
- **Center View**: Manually center map on current panoramic location
- **Scene Markers**: Click green dots on map to jump to scenes
- **Media Type**: Switch between 360° images and videos (future)

### Real-time Information
- **Current Location**: GPS coordinates of active scene
- **Orientation**: Compass direction and degrees
- **Elevation**: Height above sea level
- **Scene Info**: Title and metadata for each location

## Technical Implementation

### Architecture
```
┌─────────────────┬─────────────────┐
│   360° Viewer   │   2D Map View   │
│   (krpano)      │   (Leaflet.js)  │
│                 │                 │
│  - Panoramic    │  - GPS Tracking │
│  - Navigation   │  - GPX Display  │
│  - Hotspots     │  - Orientation  │
│  - Controls     │  - Controls     │
└─────────────────┴─────────────────┘
```

### Integration Points
- **Scene Synchronization**: Map updates when 360° scene changes
- **Orientation Sync**: Map compass follows 360° viewer direction
- **Click Navigation**: Map markers load corresponding 360° scenes
- **GPX Overlay**: GPS tracks display with elevation data

### File Structure
```
360Tour/
├── tour.html                 # Main interface
├── tour.xml                  # Scene configuration with GPS data
├── tour.js                   # krpano viewer engine
├── 360-map-integration.js    # Custom integration logic
├── sample-track.gpx          # Demo GPX file
├── panos/                    # 360° panoramic images
├── plugins/                  # krpano plugins
└── skin/                     # UI themes
```

## 360° Camera Compatibility

### Supported Cameras
- **Insta360**: One X, One R, One RS, X3, X4
- **GoPro**: MAX, Hero 11/12 with MAX Lens
- **Ricoh Theta**: V, Z1, X
- **Samsung**: Gear 360
- **Any 360° camera** producing equirectangular images

### File Formats
- **Images**: JPG, PNG equirectangular panoramas
- **Videos**: MP4 360° videos (with video player plugin)
- **GPS**: Embedded EXIF GPS data or separate GPX tracks

## Example Use Cases

### Real Estate Tours
- Property walkthroughs with street-level context
- Neighborhood exploration with map navigation
- GPS-tagged room locations

### Travel Documentation
- Vacation spots with geographical context
- Hiking trails with elevation profiles
- City tours with landmark mapping

### Professional Surveying
- Site documentation with precise GPS coordinates
- Progress tracking with temporal GPX data
- Inspection reports with location context

### Educational Content
- Virtual field trips with map context
- Historical site exploration
- Geographic education with immersive views

## Development

### Adding New Scenes
1. Capture 360° content with GPS coordinates
2. Process images/videos for web delivery
3. Update `tour.xml` with scene data including lat/lng/alt
4. Place media files in appropriate directories

### Customization
- **Map Styles**: Modify Leaflet tile layers for different map styles
- **UI Themes**: Adjust CSS for custom appearance
- **Integration**: Extend JavaScript for additional functionality
- **Plugins**: Add krpano plugins for enhanced features

### GPX Integration
- **Upload**: Support for standard GPX files with tracks and waypoints
- **Display**: Customizable track colors and styles
- **Analysis**: Elevation profiles and distance calculations
- **Export**: Generate GPX files from tour data

## Browser Support
- **Modern Browsers**: Chrome, Firefox, Safari, Edge
- **Mobile**: iOS Safari, Android Chrome
- **WebGL**: Required for 360° rendering
- **Geolocation**: Optional for user position tracking

## License
Open source project - see repository for license details.