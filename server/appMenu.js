// const { app } = require("electron/main");

const appMenu =  (data) => [
    {
        label: "Open",
        submenu: [
            {
                label: "Material Tracker",
                // accelerator: "CmdOrCtrl+M",
                click: () => {
                    data.createMaterialWindow()
                }
            },
            {
                label: "Overlay",
                // accelerator: "CmdOrCtrl+N",
                click: () => {
                    data.createOverlay()
                }
            },
            // {
            //     type: "separator"
            // },
            // {
            //     label: "Quit",
            //     // accelerator: "CmdOrCtrl+Q",
            //     click: () => {
            //         app.quit();
            //     }
            // }
        ]
    },
    {
        label: "Console",
        submenu: [
            {
                label: "Material Tracker",
                // accelerator: "CmdOrCtrl+M",
                click: () => {
                    let win = data.getMaterialWindow()
                    if (win) {
                        win.webContents.openDevTools();
                    }
                }
            },
            {
                label: "Overlay",
                // accelerator: "CmdOrCtrl+M",
                click: () => {
                    let win = data.getOverlayWindow()
                    if (win) {
                        win.webContents.openDevTools();
                    }
                }
            },
        ]
    }
];

module.exports = {appMenu}