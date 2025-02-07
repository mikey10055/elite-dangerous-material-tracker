const { app, BrowserWindow, screen, Menu } = require("electron");
const path = require("path");
const { Config } = require("./config.js");
const { appMenu } = require("./server/appMenu.js");

let materialWindow = null;
let overlayWindow = null;

const createMaterialWindow = () => {
    if (materialWindow !== null) {
        materialWindow.focus();
        return;
    }
    const win = new BrowserWindow({
        width: 450,
        height: 700,
        webPreferences: {
            preload: path.join(__dirname, "./client/preload.js"),
            contextIsolation: true,
            nodeIntegration: true
        }
    })

    materialWindow = win;

    // win.webContents.openDevTools();

    win.loadFile("./client/materialWindow/index.html");

    Menu.setApplicationMenu(menu);


    win.on('closed', () => {
        materialWindow = null;
    });
}

const createOverlay = () => {
    if (overlayWindow !== null) {
        overlayWindow.focus();
        return;
    }

    const { width, height } = screen.getPrimaryDisplay().size;

    const win = new BrowserWindow({
        width,
        height,
        frame: false,
        transparent: true,
        alwaysOnTop: true,
        fullscreen: true,
        resizable: false,
        webPreferences: {
            preload: path.join(__dirname, "./client/preload.js"),
            contextIsolation: true,
            nodeIntegration: true
        }
    });
    
    overlayWindow = win;
    
    win.setIgnoreMouseEvents(true); 
    // win.webContents.openDevTools();
    win.loadFile("./client/overlayWindow/overlay.html");

    win.on('closed', () => {
        overlayWindow = null;
    });

};


const menu = Menu.buildFromTemplate(
    appMenu({
        createOverlay,
        createMaterialWindow,
        getMaterialWindow: () => materialWindow,
        getOverlayWindow: () => overlayWindow
    })
);

app.whenReady().then(() => {
    createMaterialWindow();
    if (Config.EnableOverlay) {
        createOverlay();
    }
})

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit()
})