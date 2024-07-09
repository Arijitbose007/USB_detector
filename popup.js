const { ipcRenderer } = require('electron');

ipcRenderer.on('device-info', (event, { title, message, device }) => {
  document.getElementById('popup-title').innerText = title;
  document.getElementById('popup-message').innerText = message;

  const deviceInfo = `
    Device Name: ${device.deviceName}
    Manufacturer: ${device.manufacturer}
    Serial Number: ${device.serialNumber}
    Port: ${device.deviceAddress}
  `;
  document.getElementById('device-info').innerText = deviceInfo;

  const popupContainer = document.getElementById('popup-container');
  if (title.includes('Added')) {
    popupContainer.classList.add('device-added');
    popupContainer.classList.remove('device-removed');
  } else if (title.includes('Removed')) {
    popupContainer.classList.add('device-removed');
    popupContainer.classList.remove('device-added');
  }
});
