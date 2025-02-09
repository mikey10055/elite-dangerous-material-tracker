const { app, BrowserWindow, screen, Menu } = require("electron");
const path = require("path");
const { Config } = require("./config.js");
const { appMenu } = require("./server/appMenu.js");

let materialWindow = null;
let overlayWindow = null;
let stationSearchWindow = null;

function forceAlwaysOnTop() {
    if (overlayWindow) {
        overlayWindow.setAlwaysOnTop(true, "screen-saver");
        setTimeout(forceAlwaysOnTop, 10000)
    }
}

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
const createStationSearchWindow = () => {
    if (stationSearchWindow !== null) {
        stationSearchWindow.focus();
        return;
    }
    const win = new BrowserWindow({
        width: 1280,
        height: 900,
        webPreferences: {
            preload: path.join(__dirname, "./client/preload.js"),
            contextIsolation: true,
            nodeIntegration: true
        }
    })

    stationSearchWindow = win;

    // win.webContents.openDevTools();

    win.loadFile("./client/stationSearchWindow/index.html");

    Menu.setApplicationMenu(menu);

    win.on('closed', () => {
        stationSearchWindow = null;
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
        alwaysOnTop: false,
        fullscreen: true,
        resizable: false,
        webPreferences: {
            preload: path.join(__dirname, "./client/preload.js"),
            contextIsolation: true,
            nodeIntegration: true
        }
    });
    
    overlayWindow = win;

    forceAlwaysOnTop();
    
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
        createStationSearchWindow,
        getMaterialWindow: () => materialWindow,
        getOverlayWindow: () => overlayWindow,
        getStationSearchWindow: () => stationSearchWindow
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