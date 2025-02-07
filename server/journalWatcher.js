const fs = require('fs');
const path = require('path');

const os = require('os');

const homedir = os.homedir();

class JournalWatcher {
    constructor(journalDir) {
        this.journalDir = journalDir ?? path.join(homedir, "/Saved Games/Frontier Developments/Elite Dangerous/");
        this.watcher = null;
        this.eventManager = new EventTarget();
        this.filePositions = new Map();
    }

    dispatch(eventName, data) {
        const event = new CustomEvent(eventName, { detail: data });
        this.eventManager.dispatchEvent(event);
    }

    startWatching() {
        if (!fs.existsSync(this.journalDir)) {
            console.error(`Journal directory does not exist: ${this.journalDir}`);
            return;
        }

        this.watcher = fs.watch(this.journalDir, (eventType, filename) => {
            const filePath = path.join(this.journalDir, filename);

            if (filename && filename.startsWith("Status.json")) {
                let data = this.getfileData(filePath);
                if (data.length > 0) {
                    try {
                        let json = JSON.parse(data);
                        this.dispatch("StatusUpdate", { json });
                    } catch (error) {
                        console.log("Status error", error);
                    }
                }
            }


            if (filename && filename.startsWith("NavRoute.json")) {
                let data = this.getfileData(filePath);
                if (data.length > 0) {
                    try {
                        let json = JSON.parse(data);
                        this.dispatch("NavDataUpdate", { json });
                    } catch (error) {
                        console.log("NavData error", error);
                    }
                }
            }

            if (filename && filename.startsWith("Market.json")) {
                let data = this.getfileData(filePath);
                if (data.length > 0) {
                    try {
                        let json = JSON.parse(data);
                        this.dispatch("MarketUpdate", { json });
                    } catch (error) {
                        console.log("Market error", error);
                    }
                }
            }

            if (filename && filename.startsWith("Journal.")) {
                // this.dispatch('journalUpdate', { eventType, filePath, json: [] });

                this.processFileChange(filePath);

            }
        });

        console.log(`Watching journal files in: ${this.journalDir}`);
    }

    getNavData() {
        const filePath = path.join(this.journalDir, "NavRoute.json");
        let data = fs.readFileSync(filePath);

        try {
            return JSON.parse(data);
        } catch (error) {
            console.log(error);
            return { Route: [] };
        }

    }

    getfileData(file) {
        let fileData = fs.readFileSync(file, "utf-8");
        return fileData;
    }


    async processFileChange(filePath) {
        try {
            const lastPosition = this.filePositions.get(filePath) || 0;
            const stats = fs.statSync(filePath);
            if (stats.size > lastPosition) {
                const newContent = await this.readNewLines(filePath, lastPosition);
                if (newContent.length > 0) {

                    try {
                        let json = newContent.map(nc => JSON.parse(nc));
                        this.dispatch('journalUpdate', { filePath, json });

                        for (let index = 0; index < json.length; index++) {
                            const eventObj = json[index];
                            this.dispatch(eventObj.event, { filePath, json: eventObj });

                        }

                    } catch (error) {
                        console.log(error);
                    }

                }
            }
            this.filePositions.set(filePath, stats.size);
        } catch (error) {
            console.error(`Error processing file: ${filePath}`, error);
        }
    }

    readNewLines(filePath, startPosition) {
        return new Promise((resolve, reject) => {
            fs.open(filePath, 'r', (err, fd) => {
                if (err) return reject(err);
                
                const stats = fs.statSync(filePath);
                const buffer = Buffer.alloc(stats.size);
                // const buffer = Buffer.alloc(1024 * 64); // 64 KB buffer
                fs.read(fd, buffer, 0, buffer.length, startPosition, (err, bytesRead) => {
                    fs.close(fd, () => { }); // Close file descriptor
                    if (err) return reject(err);
                    const newContent = buffer.toString('utf-8', 0, bytesRead).trim();
                    resolve(newContent.split('\r\n'));
                });
            });
        });
    }

    stopWatching() {
        if (this.watcher) {
            this.watcher.close();
            this.watcher = null;
            console.log("Stopped watching journal files.");
        }
    }

    on(eventName, callback) {
        try {
            this.eventManager.addEventListener(eventName, (event) => callback(event.detail));
        } catch (error) {
            console.log(error, callback, eventName);
        }
    }
}

module.exports =  { JournalWatcher };
