import { Blueprints } from "../data/blueprints.js";

const bps = Blueprints;

export class Blueprint {
    constructor(data) {
        this.type = data.Type;
        this.name = data.Name;
        this.engineers = data.Engineers || [];
        this.ingredients = data.Ingredients || [];
        this.effects = data.Effects || [];
        this.grade = data.Grade;
    }

    html(mats, searchValue="", engs, cargo) {

        let searchSplit = searchValue.split("|");

        let div = document.createElement("div");
        div.classList.add("blueprint");

        let name = document.createElement("span");
        name.classList.add("bp-name");
        let type = document.createElement("span");
        type.classList.add("bp-type");

        name.textContent = this.name;
        type.textContent = this.type;

        if (searchValue.length > 0) {
            searchSplit.forEach((st) => {
                if (this.name.toLowerCase().includes(st.toLowerCase())) {
                    name.classList.add("name-found-in-search");
                }
            })
            searchSplit.forEach((st) => {
                if (this.type.toLowerCase().includes(st.toLowerCase())) {
                    type.classList.add("type-found-in-search");
                }
            })
        }


        let ingredientContainer = document.createElement("div");
        ingredientContainer.classList.add("ingredientContainer");


        for (let index = 0; index < this.ingredients.length; index++) {
            const ingredient = this.ingredients[index];

            let found = mats.getMatByLoc(ingredient.Name);

            let ingredientItem = document.createElement("div");
            ingredientItem.classList.add("ingredientItem");

            let iname = document.createElement("span");
            iname.textContent = ingredient.Name;

            let icount = document.createElement("span");
            
            let cargoItem = cargo.Inventory.find(itm => itm.Name_Localised == ingredient.Name);
            
            if (found.length > 0) {
                let colour = parseInt(ingredient.Size) <= parseInt(found[0].Count) ? "green" : "red";
                icount.innerHTML = `<span class="${colour}">${ingredient.Size} (${found[0].Count})`;
                iname.innerHTML = `<span class="${found[0].Category}">${found[0].Category.slice(0, 1)}</span> <span> ${ingredient.Name} </span>`;
            } else {
                icount.innerHTML = `<span class="red">${ingredient.Size} (0)</span>`;
            }

            if (cargoItem) {
                let colour = parseInt(ingredient.Size) < parseInt(cargoItem.Count) ? "green" : "red";
                icount.innerHTML = `<span class="${colour}">${ingredient.Size} (${cargoItem.Count})`;
                iname.innerHTML = `<span class="Commidity">C</span> <span> ${ingredient.Name} </span>`;
            }


            if (searchValue.length > 0) {
                searchSplit.forEach((st) => {
                    if (ingredient.Name.toLowerCase().includes(st.toLowerCase())) {
                        ingredientContainer.classList.add("found-in-search")
                    }
                })
            }


            ingredientItem.appendChild(iname);
            ingredientItem.appendChild(icount);

            ingredientContainer.appendChild(ingredientItem)
        }

        let engineers = document.createElement("div");
        if (searchValue.length > 0 && this.engineers.join(", ").toLowerCase().includes(searchValue.toLowerCase())) {
            // engineers.classList.add("found-in-search");
        }
        engineers.innerHTML = `Engineers: ${this.engineers.map(r => {
            let found = engs.find(e => e.Engineer ? e.Engineer.toLowerCase() == r.toLowerCase() : false);
            let searchFound = searchValue.length > 0 && r.toLowerCase().includes(searchValue.toLowerCase()) ? "found-in-search" : "";
            if (found) {
                let colour = found.Rank && found.Rank >= this.grade || this.grade === undefined ? "green" : "red";
                if (found.Progress == "Invited") {
                    colour = "yellow";
                }
                return `<span title="${found.Progress}" class="${colour} ${searchFound}">${r}</span>`
            }
            return `<span class="grey ${searchFound}">${r}</span>`;
        }).join(", ")}`;

        let effects = document.createElement("div");
        effects.innerHTML = this.effects.map(r => `<span class="${r.IsGood ? "green" : "red"}">${r.Effect} ${r.Property}</span>`).join(" | ");

        div.appendChild(type);
        div.appendChild(name);

        if (typeof this.grade !== "undefined") {
            let grade = document.createElement("span");
            grade.textContent = `Grade: ${this.grade}`;
            div.appendChild(grade);
        }
        
        div.appendChild(effects);
        div.appendChild(engineers);
        div.appendChild(ingredientContainer);

        return div;
    }
}

export class BlueprintManager {
    constructor(blueprints = []) {
        this.blueprints = blueprints.map(bp => new Blueprint(bp));
    }

    getBlueprintsByType(type) {
        return this.blueprints.filter(bp => bp.type === type);
    }

    getBlueprintsByName(name) {
        return this.blueprints.filter(bp => bp.name === name);
    }

    getBlueprintsByEngineer(engineerName) {
        return this.blueprints.filter(bp => bp.hasEngineer(engineerName));
    }

    getBlueprintsByGrade(grade) {
        return this.blueprints.filter(bp => bp.grade === grade);
    }

    html(mats, searchValue="", engs, cargo) {
        let div = document.createElement("div");

        let items = {};

        for (let index = 0; index < this.blueprints.length; index++) {
            const bp = this.blueprints[index];
            const k = bp.name + bp.type;
            if (!items[k]) {
                let con = document.createElement("div");
                con.classList.add("bp-group");
                items[k] = con;
            }

            let b = bp.html(mats, searchValue, engs, cargo);

            let hasIngredent = b.querySelector(".found-in-search, .name-found-in-search, .type-found-in-search");

            if (searchValue.length > 0) {
                if (hasIngredent) {
                    items[k].classList.add("ingredents-found")
                } else {
                    items[k].classList.add("hide")
                }

            }


            items[k].appendChild(b);
            // div.appendChild(bp.html());
        }

        let itmKeys = Object.keys(items);

        for (let indexi = 0; indexi < itmKeys.length; indexi++) {
            const item = items[itmKeys[indexi]];
            div.appendChild(item);
        }

        return div;
    }

}

export const AllBlueprints = new BlueprintManager(bps);