const { contextBridge } = require('electron');

const { JournalWatcher } = require("../server/journalWatcher.js");
const Config = require('../config.js');

const watcher = new JournalWatcher();

// watcher.on('journalUpdate', ({ filePath, json }) => {
//     // console.log(`New entries in ${filePath}:`);
//     console.log(json.map(e => e.event).join(","), json);
//     // newContent.forEach(line => console.log(line));
// });

watcher.startWatching();

contextBridge.exposeInMainWorld('journal', {
    on: (name, cb) => watcher.on(name, cb),
    getNavData: () => watcher.getNavData()
})

contextBridge.exposeInMainWorld('config', Config);