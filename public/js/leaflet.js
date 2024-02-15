export const displayMap = (locations) => {
  const map = L.map('map', { zoomControl: false });
   
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);
   
  var greenIcon = L.icon({
    iconUrl: '/img/pin.png',
    iconSize: [32, 40], 
    iconAnchor: [16, 45], 
    popupAnchor: [0, -50], 
  });
   
  const points = [];
  locations.forEach((loc) => {
    points.push([loc.coordinates[1], loc.coordinates[0]]);
   
    L.marker([loc.coordinates[1], loc.coordinates[0]], { icon: greenIcon })
      .addTo(map)
      .bindPopup(`<p>Day ${loc.day}: ${loc.description}</p>`, {
        autoClose: false,
        className: 'mapPopup',
      })
      .on('mouseover', function (e) {
        this.openPopup();
      })
      .on('mouseout', function (e) {
        this.closePopup();
      });
  });
   
  const bounds = L.latLngBounds(points).pad(0.5);
  map.fitBounds(bounds);
   
  // Disable scroll on map
  // map.scrollWheelZoom.disable();
}
 