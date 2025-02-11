const fs = require('fs');
const path = require('path');

const os = require('os');
const { Config } = require('../config');

const homedir = os.homedir();

const station_outfitting_path = "./server/station_outfitting";
const station_market_path = "./server/station_market";

const starSystemsFile = "./server/starsystems.json";

class JournalWatcher {
    constructor(journalDir) {
        this.journalDir = journalDir ?? path.join(homedir, "/Saved Games/Frontier Developments/Elite Dangerous/");
        this.watcher = null;
        this.eventManager = new EventTarget();
        this.filePositions = new Map();

        this.saveLocationData = false;
    }

    setLocData(val=true) {
        this.saveLocationData = val;
    }

    dispatch(eventName, data) {
        const event = new CustomEvent(eventName, { detail: data });
        this.eventManager.dispatchEvent(event);
    }

    getCargo() {
        let file = path.join(this.journalDir, "Cargo.json");

        let data = fs.readFileSync(file);

        try {
            let jsn = JSON.parse(data);
            return jsn;
        } catch (error) {
            console.log(error)
            return {
                "timestamp": "2025-02-11T16:08:29Z", 
                "event": "Cargo", 
                "Vessel": "Ship", 
                "Count": 0, 
                "Inventory": []
            };
        }

    }

    getAllStationFiles() {

        let returnData = {
            outfitting: [],
            market: []
        };

        let outfittingDir = path.join(station_outfitting_path);
        let dir = fs.readdirSync(outfittingDir);

        for (let index = 0; index < dir.length; index++) {
            const file = dir[index];
            if (file.endsWith(".json")) {
                const filePath = path.join(station_outfitting_path, file);
                const data = fs.readFileSync(filePath);
    
                try {
                    let json = JSON.parse(data);
                    returnData.outfitting.push(json);
                } catch (error) {
                    console.log(error, data);
                }
            }
        }

        let marketDir = path.join(station_market_path);
        let mardir = fs.readdirSync(marketDir);

        for (let index = 0; index < mardir.length; index++) {
            const file = mardir[index];
            if (file.endsWith(".json")) {
                const filePath = path.join(station_market_path, file);
                const data = fs.readFileSync(filePath);
    
                try {
                    let json = JSON.parse(data);
                    returnData.market.push(json);
                } catch (error) {
                    console.log(error);
                }
            }
        }

        return returnData;
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

            if (filename && filename.startsWith("Cargo.json")) {
                let data = this.getfileData(filePath);
                if (data.length > 0) {
                    try {
                        let json = JSON.parse(data);
                        this.dispatch("CargoUpdate", { json });
                    } catch (error) {
                        console.log("Cargo error", error);
                    }
                }
            }

            if (filename && filename.startsWith("Outfitting.json")) {
                let data = this.getfileData(filePath);
                if (data.length > 0) {
                    try {
                        let json = JSON.parse(data);
                        this.dispatch("OutfittingUpdate", { json });
                        
                        if (Config.saveOutfittingData) {
                            let fileName = `${json.StationName.replaceAll(" ", "_")}_${json.StarSystem.replace(" ", "_")}.json`;
                            let pathLoc = path.join(station_outfitting_path, fileName);
    
                            fs.writeFileSync(pathLoc, data);
                        }

                    } catch (error) {
                        console.log("Outfitting error", error);
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

                        if (Config.saveMarketData) {
                            let fileName = `${json.StationName.replaceAll(" ", "_")}_${json.StarSystem.replace(" ", "_")}.json`;
                            let pathLoc = path.join(station_market_path, fileName);

                            fs.writeFileSync(pathLoc, data);
                        }
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

    getStarSystems() {
        const starsystems = fs.readFileSync(starSystemsFile);
        try {
            let r = JSON.parse(starsystems);
            return r;
        } catch (error) {
            console.error(error);
            return [];
        }
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

                            if (this.saveLocationData && eventObj.event === "FSDJump") {
                                let systems = this.getStarSystems();

                                let findSystem = systems.find(s => s.StarSystem === eventObj.StarSystem);
                                if (!findSystem) {

                                    systems.push({
                                        StarSystem: eventObj.StarSystem,
                                        StarPos: eventObj.StarPos,
                                        Body: eventObj.Body,
                                        BodyType: eventObj.BodyType,
                                        SystemAddress: eventObj.SystemAddress
                                    });

                                    fs.writeFileSync(starSystemsFile, JSON.stringify(systems));
                                    this.dispatch("StarSystemsUpdated", { json: systems });
                                }
                            }


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
