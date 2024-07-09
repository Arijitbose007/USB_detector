const { ipcRenderer, shell } = require('electron');

document.addEventListener('DOMContentLoaded', () => {
  const deviceTabs = document.getElementById('device-tabs');
  
  
  const storageTab = document.createElement('button');
  storageTab.id = 'storage-tab-E';
  storageTab.className = 'tab-button';
  storageTab.innerText = 'USB Storage Device (E:)';
  storageTab.onclick = () => fetchFiles('E:\\');
  storageTab.ondblclick = () => closeFileList();
  deviceTabs.appendChild(storageTab);

  
  const reloadButton = document.createElement('button');
  reloadButton.className = 'reload-button';
  reloadButton.innerHTML = '<i class="fas fa-redo"></i>';
  reloadButton.onclick = () => fetchFiles('E:\\');
  deviceTabs.appendChild(reloadButton);

  checkForStorageDevice();
});

let addedPaths = new Set();
addedPaths.add('E:\\');  

ipcRenderer.on('usb-storage-added', (event, device) => {
  device.mountpoints.forEach(mountpoint => {
    if (!addedPaths.has(mountpoint.path)) {
      const sanitizedPath = sanitizePath(mountpoint.path);
      const tab = document.createElement('button');
      tab.id = `device-tab-${sanitizedPath}`;
      tab.className = 'tab-button';
      tab.innerText = `USB Storage Device (${mountpoint.path})`;
      tab.onclick = () => fetchFiles(mountpoint.path);
      tab.ondblclick = () => closeFileList();
      document.getElementById('device-tabs').appendChild(tab);

      const reloadButton = document.createElement('button');
      reloadButton.className = 'reload-button';
      reloadButton.innerHTML = '<i class="fas fa-redo"></i>';
      reloadButton.onclick = () => fetchFiles(mountpoint.path);
      document.getElementById('device-tabs').appendChild(reloadButton);

      addedPaths.add(mountpoint.path);
    }
  });
});

ipcRenderer.on('usb-input-added', (event, device) => {
  if (device.deviceName && device.deviceName.toLowerCase().includes('storage')) {
    device.mountpoints.forEach(mountpoint => {
      if (!addedPaths.has(mountpoint.path)) {
        const sanitizedPath = sanitizePath(mountpoint.path);
        const tab = document.createElement('button');
        tab.id = `device-tab-${sanitizedPath}`;
        tab.className = 'tab-button';
        tab.innerText = `USB Storage Device (${mountpoint.path})`;
        tab.onclick = () => fetchFiles(mountpoint.path);
        tab.ondblclick = () => closeFileList();
        document.getElementById('device-tabs').appendChild(tab);

        const reloadButton = document.createElement('button');
        reloadButton.className = 'reload-button';
        reloadButton.innerHTML = '<i class="fas fa-redo"></i>';
        reloadButton.onclick = () => fetchFiles(mountpoint.path);
        document.getElementById('device-tabs').appendChild(reloadButton);

        addedPaths.add(mountpoint.path);
      }
    });
  }
});

ipcRenderer.on('usb-removed', (event, device) => {
  const deviceTabs = document.getElementById('device-tabs');
  Array.from(deviceTabs.children).forEach(child => {
    const sanitizedPath = sanitizePath(device.mountpoints[0].path);
    if (child.id.includes(sanitizedPath)) {
      const path = child.id.replace('device-tab-', '');
      addedPaths.delete(path);
      child.remove();
    }
  });
  closeFileList(); 
});

ipcRenderer.on('files-list', (event, response) => {
  const fileList = document.getElementById('file-list');
  fileList.innerHTML = '';
  if (response.success) {
    
    const messageLi = document.createElement('li');
    messageLi.classList.add('non-clickable-message');
    messageLi.innerText = 'DOUBLE CLICK TO OPEN THE FILE';
    fileList.appendChild(messageLi);

    
    response.files.forEach(file => {
        const li = document.createElement('li');
        li.innerText = `${file.name}`;
        li.onclick = () => fetchFileContent(file.path);
        li.ondblclick = () => openFile(file.path);
        fileList.appendChild(li);
    });
}


 else {
    const li = document.createElement('li');
    li.innerText = `Error: No USB Storage Device Added. Please Add A Storage Device To See The Files.`;
    fileList.appendChild(li);
  }

  const closeButton = document.createElement('button');
  closeButton.innerText = 'Close';
  closeButton.className = 'close-files-button';
  closeButton.onclick = () => closeFileList();
  fileList.appendChild(closeButton);
});

function fetchFiles(drivePath) {
  ipcRenderer.send('fetch-files', drivePath);
}

function fetchFileContent(filePath) {
  const fileExtension = path.extname(filePath).toLowerCase();

  
  const supportedTextFiles = ['.txt', '.md', '.log'];
  
  if (supportedTextFiles.includes(fileExtension)) {
    ipcRenderer.send('fetch-file-content', filePath);
  } else {
    alert(`Cannot display content of ${fileExtension} files. Double-click to open the file.`);
  }
}

function closeFileList() {
  const fileList = document.getElementById('file-list');
  fileList.innerHTML = '';
}

function openFile(filePath) {
  ipcRenderer.send('open-file', filePath);
}

ipcRenderer.on('file-content', (event, response) => {
  if (response.success) {
    const fileContent = document.createElement('pre');
    fileContent.innerText = response.content;
    document.getElementById('file-list').appendChild(fileContent);
  } else {
    console.error('Error fetching file content:', response.error);
  }
});

function checkForStorageDevice() {
  ipcRenderer.send('check-storage-devices');
}

function sanitizePath(path) {
  return path.replace(/[^a-zA-Z0-9]/g, '_');
}
