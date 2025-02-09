export class Material {
    constructor(category, name, count, locName) {
        this.Name = name ?? "";
        this.Category = category ?? "";
        this.Count = count ?? 0;
        this.Name_Localised = locName ?? name ?? "";
    }

    updateCount(amount) {
        this.Count += amount;
    }

    html(searchVal) {
        let div = document.createElement("div");

        div.classList.add("material-item")

        let name = document.createElement("span");

        name.classList.add("mat-name")
        name.title = this.Name;

        let count = document.createElement("span");
        let cat = document.createElement("span");

        name.textContent = this.Name_Localised;
        count.textContent = this.Count;
        cat.textContent = this.Category.slice(0, 1);
        
        cat.classList.add(this.Category);
        cat.classList.add("mat-category");

        if (searchVal.length > 0) {
            if (this.Name_Localised.toLowerCase().includes(searchVal)) {
                div.classList.add("found");
            }
        } else {
            div.classList.add("found");
        }

        div.appendChild(cat);
        div.appendChild(name);
        div.appendChild(count);

        return div;

    }

}

export class Materials {
    constructor(raw, encoded, manufactured) {
        this.setMats(raw, encoded, manufactured);
    }

    setMats(raw, encoded, manufactured) {
        this.Raw = raw ? raw.map(m => new Material("Raw", m.Name, m.Count)) : [];
        this.Encoded = encoded ? encoded.map(m => new Material("Encoded", m.Name, m.Count, m.Name_Localised)) : [];
        this.Manufactured = manufactured ? manufactured.map(m => new Material("Manufactured", m.Name, m.Count, m.Name_Localised)) : [];
    }

    getMatByLoc(locName) {
        let all = [...this.Raw, ...this.Encoded, ...this.Manufactured];
        let found = all.find(r => locName.toLowerCase().includes(r.Name_Localised.toLowerCase()));
        return found ? [found] : [];
    }

    updateUnknownCatergory(name, amount, locName) {
        let isRaw = this.Raw.find(m => m.Name == name);
        let isEncoded = this.Encoded.find(m => m.Name == name);
        let isManufactured = this.Manufactured.find(m => m.Name == name);

        if (isRaw) {
            this.updateMaterial("Raw", name, amount, locName);
        }
        
        if (isEncoded) {
            this.updateMaterial("Encoded", name, amount, locName);
        }

        if (isManufactured) {
            this.updateMaterial("Manufactured", name, amount, locName);
        }

        if (locName == "Modified Embedded Firmware") {
            console.error(isRaw, isEncoded, isManufactured, name, amount, locName);
        }

    }

    updateMaterial(category, name, amount, locName,t="") {
        let mat = this[category].find(m => m.Name == name);
        if (mat) {
            mat.updateCount(amount);
        } else {
            let mat = new Material(category, name, amount, locName);
            this[category].push(mat);
        }

        if (locName == "Modified Embedded Firmware") {
            // console.error(category, name, amount, locName, t);
        }
    }

    html(searchValue) {

        let div = document.createElement("div");

        this.Raw.forEach(m => div.appendChild(m.html(searchValue)));
        this.Encoded.forEach(m => div.appendChild(m.html(searchValue)));
        this.Manufactured.forEach(m => div.appendChild(m.html(searchValue)));

        return div;
    }


}