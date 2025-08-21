# Google Maps Integration Setup

This document explains how to set up Google Maps integration for the Household Planet Kenya application.

## Overview

The application now includes interactive Google Maps functionality for:
- **Contact Page**: Shows store location with interactive map
- **Delivery Locations**: Interactive map showing delivery coverage across Kenya
- **Fallback Support**: Automatically falls back to iframe maps if API key is not configured

## Features Implemented

### 1. Interactive Google Maps Component (`GoogleMap.tsx`)
- Fully interactive Google Maps with markers
- Custom info windows with store information
- Automatic fallback to iframe maps
- Error handling and graceful degradation

### 2. Delivery Map (`DeliveryMap.tsx`)
- Shows delivery locations across Kenya
- Color-coded markers by delivery tier
- Interactive markers with pricing and delivery time info
- Coverage statistics and legend

### 3. Enhanced Contact Map (`ContactMap.tsx`)
- Store location with detailed information
- Interactive marker with store details
- Direct links to Google Maps for directions
- Responsive design with store information panel

### 4. Delivery Locations Enhancement
- Toggle between list and map view
- Integrated map functionality
- Maintains existing filtering and search

## Setup Instructions

### Step 1: Get Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing project
3. Enable the following APIs:
   - Maps JavaScript API
   - Places API (optional, for enhanced features)
4. Create credentials (API Key)
5. Restrict the API key to your domain for security

### Step 2: Configure Environment Variables

Add your Google Maps API key to `.env.local`:

```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_actual_api_key_here
```

### Step 3: Test the Integration

1. Start the development server:
   ```bash
   cd household-planet-frontend
   npm run dev
   ```

2. Visit the following pages to test:
   - `/contact` - Interactive store location map
   - `/delivery` - Toggle to map view to see delivery coverage

## Fallback Behavior

If no API key is configured or there's an error loading Google Maps:
- The application automatically falls back to iframe-based maps
- All functionality remains available
- Users can still view locations and get directions
- No JavaScript errors or broken functionality

## API Key Security

- API key is stored as an environment variable
- Key should be restricted to your domain in Google Cloud Console
- Never commit actual API keys to version control
- Use different keys for development and production

## Customization

### Adding New Locations

To add new delivery locations to the map:

1. Update the `getLocationCoordinates` function in `DeliveryMap.tsx`
2. Add coordinates for new cities/towns
3. The system will automatically display them on the map

### Styling the Map

Customize map appearance by modifying the `styles` array in `GoogleMap.tsx`:

```javascript
styles: [
  {
    featureType: 'poi',
    elementType: 'labels',
    stylers: [{ visibility: 'off' }]
  }
  // Add more styling rules
]
```

## Troubleshooting

### Map Not Loading
- Check if API key is correctly set in `.env.local`
- Verify API key has Maps JavaScript API enabled
- Check browser console for error messages
- Ensure domain is whitelisted in Google Cloud Console

### Markers Not Appearing
- Verify coordinates are correct (latitude, longitude)
- Check marker data format matches expected interface
- Ensure info window content is properly formatted

### Performance Issues
- Consider implementing map clustering for many markers
- Lazy load maps on page scroll
- Optimize marker icons and info window content

## Cost Considerations

Google Maps API usage is charged based on:
- Map loads
- API requests
- Features used

Monitor usage in Google Cloud Console and set up billing alerts.

## Future Enhancements

Potential improvements:
- Real-time delivery tracking
- Route optimization
- Geolocation for nearest store finder
- Street View integration
- Custom map themes
- Offline map support

## Support

For issues with Google Maps integration:
1. Check this documentation
2. Review Google Maps JavaScript API documentation
3. Check browser console for errors
4. Verify API key configuration and permissions