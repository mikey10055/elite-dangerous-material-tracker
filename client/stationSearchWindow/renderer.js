import { distance3D } from "../classes/distance.js";
import { StationTypes } from "../data/stationTypes.js";

const getStationData = window.journal.stations;
const on = window.journal.on;


let stationData = getStationData();

let starsystems = journal.getStarSystems();
let currentLocation = "";


const station1 = document.querySelector("#station1");
const station2 = document.querySelector("#station2");
const compEle = document.querySelector("#compare-out")

let st1val = "";
let st2val = "";

function formatDate(now) {

    const dd = String(now.getDate()).padStart(2, '0');
    const mm = String(now.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const yyyy = now.getFullYear();

    const HH = String(now.getHours()).padStart(2, '0');
    const MM = String(now.getMinutes()).padStart(2, '0');

    return `${dd}.${mm}.${yyyy} ${HH}:${MM}`;
}


function renderResult() {
    compEle.innerHTML = "";

    let tab = document.createElement("table");

    let headers = document.createElement("tr");
    headers.style.position = "sticky";
    headers.style.top = "0";
    headers.style.background = "#282828"
    headers.innerHTML = `<th>Item</th> <th>Buy at Station</th> <th>Stock</th> <th> Buy Price </th> <th>Profit</th> <th> Sell Price </th> <th>Sell to Station</th>`

    tab.appendChild(headers);

    let st1 = stationData.market.find(v => v.StationName == st1val);
    let st2 = stationData.market.find(v => v.StationName == st2val);

    if (st1 && st2) {

        let st1Items = st1.Items;
        let st2Items = st2.Items;

        let both = {
            [st1.StationName] : [],
            [st2.StationName] : []
        };

        let entries = [];

        for (let index = 0; index < st1Items.length; index++) {
            const st1Item = st1Items[index];

            let findItem = st2Items.find(itm => itm.Name === st1Item.Name);

            if (findItem && st1Item.BuyPrice > 0 && findItem.SellPrice > 0 && st1Item.Stock > 0) {
                both[st1.StationName].push(st1Item);
                both[st2.StationName].push(findItem);

                let div = document.createElement("tr");

                let profit = findItem.SellPrice - st1Item.BuyPrice;

                div.innerHTML = `<td>${findItem.Name_Localised}</td><td>${st1.StationName} : ${st1.StarSystem}</td> <td>${st1Item.Stock}</td> <td>${st1Item.BuyPrice}</td> <td class="${profit > 0 ? "green" : "red"}">${profit}</td> <td>${findItem.SellPrice}</td> <td>${st2.StationName} : ${st2.StarSystem}</td>`;

                entries.push({
                    station1Item: st1Item,
                    station2Item: findItem,
                    ele: div
                });

                // tab.appendChild(div);
            }
        }

        let sorted = entries.sort((a,b) => {
            return (b.station2Item.SellPrice - b.station1Item.BuyPrice) - (a.station2Item.SellPrice - a.station1Item.BuyPrice)
        })

        for (let index = 0; index < entries.length; index++) {
            const entry = entries[index];
            tab.appendChild(entry.ele);
        }

        compEle.appendChild(tab);

    }

}

station1.addEventListener("change", (e) => {
    st1val = e.target.value;
    renderStationCompares();
    renderResult();
});

station2.addEventListener("change", (e) => {
    st2val = e.target.value;
    renderResult()
})


function renderStationCompares() {

    station1.innerHTML = "";
    station2.innerHTML = "";

    let op1 = document.createElement("option");
    op1.textContent = "select station";

    let op2 = document.createElement("option");
    op2.textContent = "select station";

    station1.appendChild(op1);
    station2.appendChild(op2);

    let market = stationData.market;

    let op1SelStation = market.find(m => m.StationName == st1val);
    // let op2SelStation = market.find(m => m.StationName == st2val); 

    for (let index = 0; index < market.length; index++) {
        const station = market[index];

        let opt = document.createElement("option");

        const padSize = StationTypes[station.StationType];

        opt.value = station.StationName;
        opt.textContent = `${station.StationName} : ${station.StarSystem} [${padSize}]`;

        if (st1val == station.StationName) {
            opt.selected = true;
        }
        
        let distanceFromYou = "?? ";
        if (op1SelStation ) {
            let st1loc = starsystems.find(s => s.StarSystem == op1SelStation.StarSystem);
            let st2loc = starsystems.find(s => s.StarSystem == station.StarSystem);
    
            if (st1loc && st2loc) {
                distanceFromYou = distance3D(st1loc.StarPos, st2loc.StarPos).toFixed(2);
            }
        }


        let opt2 = document.createElement("option");
        opt2.value = station.StationName;
        opt2.textContent = `${station.StationName} : ${station.StarSystem} [${padSize}] (${distanceFromYou}Ly)`;

        if (st2val == station.StationName) {
            opt2.selected = true;
        }

        station1.appendChild(opt);
        station2.appendChild(opt2);
    }
}

renderStationCompares();
renderResult()

const searchEle = document.querySelector('#container input');
const stationsEle = document.querySelector('.station-info-container');

function headers() {
    let dv = document.createElement("tr");

    dv.style.position = "sticky";
    dv.style.top = "0";
    dv.style.background = "#282828"

    let name = document.createElement("td");
    name.textContent = "Name";
    let sellsfor = document.createElement("td");
    sellsfor.textContent = "Sells for"
    let buysfor = document.createElement("td");
    buysfor.textContent = "Buys for"
    let stock = document.createElement("td");
    stock.textContent = "Stock"

    dv.appendChild(name);
    dv.appendChild(sellsfor);
    dv.appendChild(buysfor);
    dv.appendChild(stock);

    return dv
}

function renderStations() {
    
    stationsEle.innerHTML = "";

    let table = document.createElement("table");

    
    let outfitting = stationData.market;
    
    for (let index = 0; index < outfitting.length; index++) {
        const station = outfitting[index];

        const stationName = `${station.StationName} : ${station.StarSystem}`;

        const ts = new Date(station.timestamp);

        const padSize = StationTypes[station.StationType];

        let distanceFromYou = "Unknown ";
        let cur = starsystems.find(s => s.StarSystem == currentLocation);
        let thisStation = starsystems.find(s => s.StarSystem == station.StarSystem);

        if (cur && thisStation) {
            distanceFromYou = distance3D(cur.StarPos, thisStation.StarPos).toFixed(2);
        }

        let tr = document.createElement("tr");
        let td = document.createElement("th");
        td.colSpan = 4;
        td.classList.add("station")
        td.innerHTML = `${stationName} (${distanceFromYou}Ly) Largest Pad Size: ${padSize}  <small>(${formatDate(ts)})</small>`;
        tr.appendChild(td);
        table.appendChild(tr);

        let items = station.Items;

        
        if (searchEle.value.length > 0) {
            items = station.Items.filter(itm => itm.Name_Localised.toLowerCase().includes(searchEle.value.toLowerCase()))
        }

        if (items.length > 0) {
            table.appendChild(headers())
        }

        for (let index = 0; index < items.length; index++) {
            const item = items[index];
            
            let itemTr = document.createElement("tr");

            let name = document.createElement("td");
            name.textContent = item.Name_Localised;
            let sellsfor = document.createElement("td");
            sellsfor.textContent = item.BuyPrice.toLocaleString();
            let buysfor = document.createElement("td");
            buysfor.textContent = item.SellPrice.toLocaleString();
            let stock = document.createElement("td");
            stock.textContent = item.Stock.toLocaleString();

            itemTr.appendChild(name);
            itemTr.appendChild(sellsfor);
            itemTr.appendChild(buysfor);
            itemTr.appendChild(stock);

            table.appendChild(itemTr);

        }

    }

    stationsEle.appendChild(table);

}

searchEle.addEventListener("input", (e) => {
    renderStations();
    stationsEle.classList.remove("no-search");

    if (e.target.value.length <= 0) {
        stationsEle.classList.add("no-search");
    }

});

renderStations();

on("Location", ({json}) => {
    currentLocation = json.StarSystem;
    renderStations();
    renderStationCompares();
})

on("FSDJump", ({json}) => {
    starsystems = journal.getStarSystems();
    currentLocation = json.StarSystem;
    renderStationCompares();
    renderStations();
})

on("OutfittinUpdate", ({json}) => {
    stationData = getStationData();
    renderStationCompares();
    renderStations();
});

on("MarketUpdate", ({json}) => {
    stationData = getStationData();
    renderStationCompares();
    renderStations();
})