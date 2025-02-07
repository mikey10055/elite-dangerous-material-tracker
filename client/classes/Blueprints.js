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

    html(mats, searchValue="") {

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

            let ingredientItem = document.createElement("div");
            ingredientItem.classList.add("ingredientItem");

            let iname = document.createElement("span");
            iname.textContent = ingredient.Name;

            let icount = document.createElement("span");

            let found = mats.getMatByLoc(ingredient.Name);

            if (found.length > 0) {
                icount.textContent = `${ingredient.Size} (${found[0].Count})`;
            } else {
                icount.textContent = `${ingredient.Size} (0)`;
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

        div.appendChild(type);
        div.appendChild(name);

        if (typeof this.grade !== "undefined") {
            let grade = document.createElement("span");
            grade.textContent = `Grade: ${this.grade}`;
            div.appendChild(grade);
        }
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

    html(mats, searchValue="") {
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

            let b = bp.html(mats, searchValue);

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