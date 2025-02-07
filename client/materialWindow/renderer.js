import { AllBlueprints } from "../classes/Blueprints.js";
import { Materials } from "../classes/Materials.js";

const on = window.journal.on;

let Mats = new Materials();

let Destination = { System: "", Name: "", Body: 0};

const bps = AllBlueprints;


on("Commander", ({json}) => {
    console.log(json);
});


const searchEle = document.querySelector('.materials-container input');
const materialsEle = document.querySelector('.materials');
const engineerEle = document.querySelector('.engineer-recipies');

function renderMaterials() {
    materialsEle.innerHTML = "";
    let matOut = Mats.html(searchEle.value);
    materialsEle.appendChild(matOut);

    engineerEle.innerHTML = "";
    engineerEle.appendChild(bps.html(Mats, searchEle.value));
}

searchEle.addEventListener("input", (e) => {
    renderMaterials();
    materialsEle.classList.remove("no-search");

    if (e.target.value.length <= 0) {
        materialsEle.classList.add("no-search");
    } 

});


on('journalUpdate', ({ filePath, json }) => {
    // console.log(`New entries in ${filePath}:`);
    console.log(json.map(e => e.event).join(","), json);
    // newContent.forEach(line => console.log(line));
});


on("Materials", ({json}) => {
    Mats.setMats(
        json.Raw,
        json.Encoded,
        json.Manufactured
    );

    renderMaterials();
});

on("MaterialTrade", ({json}) => {
    const {Paid, Received} = json;

    Mats.updateMaterial(Paid.Category, Paid.Material, -Paid.Quantity, Paid.Material_Localised);
    Mats.updateMaterial(Received.Category, Received.Material, Received.Quantity, Received.Material_Localised);

    renderMaterials();
});

on("MaterialCollected", ({json}) => {
    Mats.updateMaterial(json.Category, json.Name, json.Count, json.Name_Localised);
    renderMaterials();
})

on("EngineerCraft", ({json}) => {
    for (let ingIndex = 0; ingIndex < json.Ingredients.length; ingIndex++) {
        const ingred = json.Ingredients[ingIndex];
        console.log(ingred)

        Mats.updateUnknownCatergory(ingred.Name, -ingred.Count, ingred.Name_Localised);
    }
    
    renderMaterials();
});

on("MissionCompleted", ({json}) => {
    let mats = json.MaterialsReward;
    if (mats) {
        console.log(mats, json);
        if (Array.isArray(mats)) {
            
            for (let index = 0; index < mats.length; index++) {
                const mat = mats[index];
                Mats.updateMaterial(mat.Category_Localised, mat.Name.toLowerCase(), mat.Count, mat.Name_Localised)
            }
        } else {
            Mats.updateMaterial(mats.Category_Localised, mats.Name, mats.Count, mats.Name_Localised)
        }
        renderMaterials();
    }

})

on("StatusUpdate", ({json}) => {
    Destination = json.Destination;
})

