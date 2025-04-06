// Hide loading screen after everything is loaded
window.addEventListener('load', function() {
    setTimeout(function() {
      document.getElementById('loading-screen').style.opacity = '0';
      setTimeout(function() {
        document.getElementById('loading-screen').style.display = 'none';
        
        // Show toast notification
        setTimeout(function() {
          showToast();
        }, 1000);
      }, 500);
    }, 1500);
  });
  
  function showToast() {
    const toast = document.getElementById("toast");
    toast.className = "show";
    setTimeout(function(){ toast.className = toast.className.replace("show", ""); }, 3000);
  }
  
  // Custom map style
  const map = L.map('map', {
    zoomControl: false,
    attributionControl: false
  }).setView([20.5937, 78.9629], 4.5);
  
  // Add custom map style
  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
  }).addTo(map);
  
  // Add attribution in custom style
  L.control.attribution({
    position: 'bottomleft',
    prefix: '<a href="https://leafletjs.com">Leaflet</a>'
  }).addTo(map);
  
  // Add zoom control
  L.control.zoom({
    position: 'bottomright'
  }).addTo(map);
  
  // Custom coffee bean icon
  const iconSize = (zoom) => {
    // Adjust icon size based on device width
    const baseSize = window.innerWidth <= 480 ? 15 : 18;
    const sizeMultiplier = window.innerWidth <= 480 ? 2.4 : 2.8;
    const size = Math.round(baseSize + zoom * sizeMultiplier);
    
    // Set minimum and maximum sizes
    const minSize = window.innerWidth <= 480 ? 20 : 25;
    const maxSize = window.innerWidth <= 480 ? 60 : 70;
    
    return Math.min(maxSize, Math.max(minSize, size));
  };
  
  const createCoffeeIcon = (zoom, roastLevel) => {
    // Different colors for different roast levels
    let iconColor;
    
    switch(roastLevel.toLowerCase()) {
      case 'light':
        iconColor = '#C2A775';
        break;
      case 'medium':
        iconColor = '#855723';
        break;
      case 'dark':
        iconColor = '#3E2723';
        break;
      case 'medium-dark':
        iconColor = '#5D4037';
        break;
      default:
        iconColor = '#795548';
    }
    
    const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="${iconSize(zoom)}" height="${iconSize(zoom)}">
      <path fill="${iconColor}" d="M12,2a9,9 0 1,0 0,18a9,9 0 1,0 0,-18z M7,7a2,3 0 1,1 0,6a2,3 0 1,1 0,-6z" />
      <path fill="#00000020" d="M7,7a2,3 0 1,0 0,6a2,3 0 1,0 0,-6z M12,4a2,2 0 1,0 0,4a2,2 0 1,0 0,-4z M16,7a2,2 0 1,0 0,4a2,2 0 1,0 0,-4z M16,12a2,2 0 1,0 0,4a2,2 0 1,0 0,-4z M12,14a2,2 0 1,0 0,4a2,2 0 1,0 0,-4z" />
    </svg>`;
    
    return L.divIcon({
      html: svg,
      className: 'coffee-bean-icon',
      iconSize: [iconSize(zoom), iconSize(zoom)],
      iconAnchor: [iconSize(zoom)/2, iconSize(zoom)/2],
      popupAnchor: [0, -iconSize(zoom)/2]
    });
  };
  
  // Set up responsive map views
  const getDefaultView = () => {
    // Adjust default view based on screen size
    if (window.innerWidth <= 480) {
      return {
        center: [20.5937, 78.9629],
        zoom: 3.8
      };
    } else if (window.innerWidth <= 768) {
      return {
        center: [20.5937, 78.9629],
        zoom: 4
      };
    } else {
      return {
        center: [20.5937, 78.9629],
        zoom: 4.5
      };
    }
  };
  
  const getWorldView = () => {
    // Adjust world view based on screen size
    if (window.innerWidth <= 480) {
      return {
        center: [0, 0],
        zoom: 1.5
      };
    } else {
      return {
        center: [0, 0],
        zoom: 2
      };
    }
  };
  
  let defaultView = getDefaultView();
  let worldView = getWorldView();
  let isZoomedOut = false;
  
  // Update views on resize
  window.addEventListener('resize', () => {
    defaultView = getDefaultView();
    worldView = getWorldView();
    
    // Update marker sizes
    if (coffeeMarkers && coffeeMarkers.length > 0) {
      const zoom = map.getZoom();
      coffeeMarkers.forEach(({ coffee, marker }) => {
        marker.setIcon(createCoffeeIcon(zoom, coffee["Roast Level"]));
      });
    }
  });
  
  document.getElementById('zoomToggleBtn').addEventListener('click', () => {
    if (isZoomedOut) {
      map.flyTo(defaultView.center, defaultView.zoom, {
        duration: 1.5
      });
    } else {
      map.flyTo(worldView.center, worldView.zoom, {
        duration: 1.5
      });
    }
    isZoomedOut = !isZoomedOut;
    
    // Animate icon rotation
    const icon = document.getElementById('zoomIcon');
    icon.style.transform = isZoomedOut ? 'rotate(180deg)' : 'rotate(0deg)';
  });
  
  // Help dialog functionality
  const helpBtn = document.getElementById('helpBtn');
  const helpDialog = document.getElementById('helpDialog');
  const closeDialog = document.querySelector('.close-dialog');
  
  helpBtn.addEventListener('click', () => {
    helpDialog.style.display = 'flex';
  });
  
  closeDialog.addEventListener('click', () => {
    helpDialog.style.display = 'none';
  });
  
  helpDialog.addEventListener('click', (e) => {
    if (e.target === helpDialog) {
      helpDialog.style.display = 'none';
    }
  });
  
  // Coffee data processing
  let coffeeMarkers = [];
  
  fetch('coffee.json')
    .then(response => response.json())
    .then(coffeeData => {
      coffeeMarkers = coffeeData.map((coffee) => {
        const marker = L.marker([coffee.Latitude, coffee.Longitude], {
          icon: createCoffeeIcon(map.getZoom(), coffee["Roast Level"])
        }).addTo(map);
  
        marker.bindPopup(
          `<strong>${coffee["Estate Name"]}</strong>
           <em>${coffee["Roast Level"]} Roast</em>
           <p>${coffee["Description"]}</p>`,
           {
             closeButton: false,
             autoPan: true,
             className: 'coffee-popup'
           }
        );
  
        return { coffee, marker };
      });
  
      map.on('zoomend', () => {
        const zoom = map.getZoom();
        coffeeMarkers.forEach(({ coffee, marker }) => {
          marker.setIcon(createCoffeeIcon(zoom, coffee["Roast Level"]));
        });
      });
    })
    .catch(error => {
      console.error('Error loading coffee data:', error);
      // Show error toast
      document.getElementById("toast").textContent = "Failed to load coffee data. Please try again later.";
      showToast();
    });