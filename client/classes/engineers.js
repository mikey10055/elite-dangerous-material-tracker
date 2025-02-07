import { Material } from "./Materials"

export const Engineers = []


const EngineerRecipyNames = {
    HullReinforcement: "Hull Reinforcement"
}

export const EngineerRecipies = {
    [EngineerRecipyNames.HullReinforcement]: {
        1: { 
            engineers: [
                "Liz Ryder",
                "Selene Jean",
                "Petra Olmanova",
            ],
            materials: [
                new Material("Raw", "carbon", 1, "carbon")
            ],
        },
        2: {
            engineers: [
                "Selene Jean",
                "Petra Olmanova"
            ],
            materials: [
                new Material("Raw", "carbon", 1, "carbon"),
                new Material("Manufactured", "shieldemitters", 1, "Manufactored")
            ]
        }
    }
}