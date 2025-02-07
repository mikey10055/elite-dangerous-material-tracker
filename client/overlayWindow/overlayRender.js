import { showPopupMessage } from "../classes/popup.js";
import { Blueprints } from "../data/blueprints.js";
import { speakLocalText } from "../speechToText.js";

const on = window.journal.on;

let CurrentSystem = ""

let route = window.journal.getNavData().Route;

let firstLoad = true;

let Earning = 0;
let Spending = 0;

on('journalUpdate', ({ filePath, json }) => {
    firstLoad = true;
});

function renderNav() {

    let r = document.querySelector("#route");


    if (r && route.length > 0) {
        r.innerHTML = "";

        let currentSystemSpan = false;
        
        for (let index = 0; index < route.length; index++) {
            const system = route[index];
            let span = document.createElement("span");
            let spanArrow = document.createElement("span");
            spanArrow.textContent = " → ";

            span.textContent = `${system.StarSystem} (${system.StarClass})`;

            if (system.StarSystem == CurrentSystem) {
                span.classList.add("current");
                currentSystemSpan = span;
            }
            r.appendChild(span);
            if (index !== route.length - 1) {
                r.appendChild(spanArrow);
            }
        }

        if (currentSystemSpan) {
            currentSystemSpan.scrollIntoView({ behavior: "smooth", inline: "start" });
        }

        // r.innerHTML = route.map(ru => {
        //     return `<span class="${ru.StarSystem == CurrentSystem ? "current" : ""}">${ru.StarSystem} (${ru.StarClass})</span>`
        // }).join("<span> -> </span>")

    }
}

function renderIncome() {
    let container = document.querySelector("#income");

    container.innerHTML = "";

    let earn = document.createElement("div");
    let cost = document.createElement("div");
    let total = document.createElement("div");

    earn.textContent = Earning.toLocaleString() + " Cr";
    cost.textContent = "-" + Spending.toLocaleString() + " Cr";
    total.textContent = (Earning - Spending).toLocaleString() + " Cr";
    earn.classList.add("green");
    cost.classList.add("red");
    if (Earning - Spending >= 0) {
        total.classList.add("green");
    } else {
        total.classList.add("red");
    }

    container.appendChild(earn);
    container.appendChild(cost);
    container.appendChild(total);

}

function speak(text) {
    if (firstLoad) {
        speakLocalText(text);
    }
}

renderNav();
renderIncome();

on("NavDataUpdate", ({json}) => {
    if (json.Route.length > 0) {
        route = json.Route;
        // speakGalnet(`Navagation updated. ${json.Route.length - 1} jumps added`);
    }
    renderNav();
})

on("FSDJump", ({json}) => {
    CurrentSystem = json.StarSystem;
    speak(`${json.StarSystem}`);
    renderNav();
})

on("Docked", ({json}) => {
    CurrentSystem = json.StarSystem;
    speak(`${json.StationName}`);
    renderNav();
})

on("Location", ({json}) => {
    CurrentSystem = json.StarSystem;
    renderNav();
})

on("ShipyardSwap", ({json}) => {
    speak(`Entering ${json.ShipType_Localised}`)
})

on("Friends", ({json}) => {
    // { "timestamp": "2025-02-06T01:11:12Z", "event": "Friends", "Status": "Online", "Name": "facemancdj" }
    speak(`${json.Name} is ${json.Status}`)
})


on("MissionCompleted", ({json}) => {
    if (!isNaN(json.Reward)) {
        Earning += json.Reward
    }
    if (!isNaN(json.Donated)) {
        Spending += json.Donated;
    }
    renderIncome();
})

on("RedeemVoucher", ({json}) => {
    if (!isNaN(json.Amount)) {
        Earning += json.Amount;
    }

    renderIncome();
})

on("NpcCrewPaidWage", ({json}) => {
    if (json.Amount > 0) {
        speak(`Paid ${json.NpcCrewName} ${json.Amount} Credits`);
        Spending += json.Amount;
    }
    renderIncome();

})

on("RefuelAll", ({json}) => {
    if (!isNaN(json.Cost)) {
        Spending += json.Cost
    }
    renderIncome();
})

on("SellDrones", ({ json }) => {
    if (!isNaN(json.TotalSale)) {
        Earning += json.TotalSale
    }
    renderIncome();
})

on("BuyDrones", ({ json }) => {
    if (!isNaN(json.TotalCost)) {
        Spending += json.TotalCost
    }
    renderIncome();
})

on("Repair", ({json}) => {
    if (!isNaN(json.Cost)) {
        Spending += json.Cost
    }
    renderIncome();
})

on("MarketBuy", ({ json }) => {
    if (!isNaN(json.TotalCost)) {
        Spending += json.TotalCost
    }
    renderIncome();
})

on("BuyAmmo", ({ json }) => {
    if (!isNaN(json.Cost)) {
        Spending += json.Cost
    }
    renderIncome();
})

on("MarketSell", ({ json }) => {
    if (!isNaN(json.TotalSale)) {
        Earning += json.TotalSale
    }
    renderIncome();
})

on("MultiSellExplorationData", ({json}) => {
    if (!isNaN(json.TotalEarnings)) {
        Earning += json.TotalEarnings
    }
    renderIncome();
})

on("PayFines", ({json}) => {
    if (!isNaN(json.Amount)) {
        Earning += json.Amount
    }
    renderIncome();
})

on("RestockVehicle", ({json}) => {
    if (!isNaN(json.Cost)) {
        Earning += json.Cost
    }
    renderIncome();
})

on("MaterialCollected", ({ json }) => {
    showPopupMessage(`Collected ${json.Category} ${json.Count} ${json.Name_Localised}`);
})

window.aaa = showPopupMessage