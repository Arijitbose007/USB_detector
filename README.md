
# USB Detector

This project is a USB detection application built using Electron and Node.js. It detects USB devices, identifies if they are storage devices, and allows users to browse and fetch files from USB storage devices.

## Prerequisites

Ensure you have the following installed on your system:
- Node.js v18.17.0
- Electron v31.1.0
- npm (Node Package Manager)

## Run Locally
### 1. Clone the Repository

```sh
git clone https://github.com/Arijitbose007/USB_detector.git
cd USB_detector
```

### 2. Install Dependencies

Remove existing `node_modules` and `package-lock.json` to avoid version conflicts:

- **Windows:**

```sh
Remove-Item -Recurse -Force node_modules, package-lock.json
```

- **macOS and Linux:**

```sh
rm -rf node_modules package-lock.json
```

Install the required dependencies:

```sh
npm install
```

### 3. Rebuild Native Modules

Rebuild the native modules to ensure compatibility with your Node.js version:

```sh
npm rebuild
```
```sh
npx electron-rebuild
```
### 4. Run the Application

Start the application using npm:

```sh
npm start
```

## Troubleshooting

### Common Issues

1. **Node.js Version Mismatch**:
   - Ensure you are using Node.js v18.17.0.
   - Use `nvm` (Node Version Manager) to manage and switch between different Node.js versions if necessary.

2. **Permission Issues**:
   - On Unix-based systems, you may need to run commands with `sudo` if you encounter permission issues.

3. **Missing Dependencies**:
   - Run `npm install` to ensure all dependencies are installed.

4. **Application Fails to Start**:
   - Check the console output for errors and ensure all steps were followed correctly.

5. **Rebuilding Native Modules**:
   - If you encounter an error related to native modules (e.g., `usb-detection`), follow these steps:
     ```sh
     # Windows:
     Remove-Item -Recurse -Force node_modules, package-lock.json

     # macOS and Linux:
     rm -rf node_modules package-lock.json

     npm install
     npm rebuild
     npx electron-rebuild
     npm start
     ```

## Project Structure

- `main.js`: Main Electron process that handles window creation and USB detection.
- `renderer.js`: Renderer process that updates the UI with detected devices and handles file fetching.
- `index.html`: The main HTML file containing the structure of the application.
- `package.json`: Contains metadata about the project and its dependencies.
