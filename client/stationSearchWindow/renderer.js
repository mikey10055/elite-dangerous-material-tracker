const getStationData = window.journal.stations;
const on = window.journal.on;


let stationData = getStationData();


const station1 = document.querySelector("#station1");
const station2 = document.querySelector("#station2");
const compEle = document.querySelector("#compare-out")

let st1val = "";
let st2val = "";


function renderResult() {
    compEle.innerHTML = "";

    let tab = document.createElement("table");

    let headers = document.createElement("tr");
    headers.innerHTML = `<th>Item</th> <th>Buy at Station</th> <th>Stock</th> <th> Buy Price </th> <th>Profit</th> <th> Sell Price </th> <th>Sell to Station</th>`

    tab.appendChild(headers);

    let st1 = stationData.market.find(v => v.StationName == st1val);
    let st2 = stationData.market.find(v => v.StationName == st2val);

    if (st1 && st2) {
        console.log(st1, st2)

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

        console.log(sorted);

        for (let index = 0; index < entries.length; index++) {
            const entry = entries[index];
            tab.appendChild(entry.ele);
        }

        compEle.appendChild(tab);

    }

}


station1.addEventListener("change", (e) => {
    st1val = e.target.value;
    renderResult()
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
    for (let index = 0; index < market.length; index++) {
        const station = market[index];

        let opt = document.createElement("option");

        opt.value = station.StationName;
        opt.textContent = `${station.StationName} : ${station.StarSystem}`;

        let opt2 = document.createElement("option");
        opt2.value = station.StationName;
        opt2.textContent = `${station.StationName} : ${station.StarSystem}`;

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

        const stationName = `${station.StarSystem} : ${station.StationName}`;

        let tr = document.createElement("tr");
        let td = document.createElement("th");
        td.colSpan = 4;
        td.classList.add("station")
        td.textContent = stationName;
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


        // if (searchEle.value.length > 0 && !stationName.includes(searchEle.value)) {
        //     // tr.classList.add("hide");
        // } else {
        // }


        // if (searchEle.value.length > 0) {
        //     let hasComp = station.Items.find(itm => itm.Name_Localised.toLowerCase().includes(searchEle.value.toLowerCase()));
        //     // let hasComp = station.Items.find(itm => itm.Rare);
        //     if (hasComp) {
        //         // tr.classList.add("red");
        //         let dv = document.createElement("tr");
                
        //         let name = document.createElement("td");
        //             name.textContent = hasComp.Name_Localised;
        //         let sellsfor = document.createElement("td");
        //             sellsfor.textContent = hasComp.BuyPrice.toLocaleString();
        //         let buysfor = document.createElement("td");
        //             buysfor.textContent = hasComp.SellPrice.toLocaleString();
        //         let stock = document.createElement("td");
        //             stock.textContent = hasComp.Stock.toLocaleString();
    
        //         // dv.textContent = `${hasComp.Name_Localised} | Sells for: ${hasComp.BuyPrice.toLocaleString()} | Buys for ${hasComp.SellPrice.toLocaleString()} | has ${hasComp.Stock.toLocaleString()}`
                
        //         dv.appendChild(name);
        //         dv.appendChild(sellsfor);
        //         dv.appendChild(buysfor);
        //         dv.appendChild(stock);

        //         table.appendChild(headers())
        //         table.appendChild(dv);
        //     } else {
        //         tr.classList.add("hide");
        //     }
        // } else {}

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


on("OutfittinUpdate", ({json}) => {
    stationData = getStationData();
    renderStationCompares();
    renderStations();
});
