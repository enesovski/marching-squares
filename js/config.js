export const Config = {
    gridSizes: [20, 40, 80],

    brush: {
        types: ["circle", "square"],
        defaultType: "circle",
        defaultSize: 1,
        minSize: 1,
        maxSize: 9,
        sizeStep: 2
    },

    camera: {
        minZoom: 0.5,
        maxZoom: 8,
        zoomFactor: 1.1
    },

    colors: {
        background: "#E6E6E6",
        fill: "#262626",
        boundary: "#CC1A1A"
    },

    save: {
        version: 1,
        defaultFileName: "marching-squares.json",
        preferredDirectory: "D:\\Onedrive\\Desktop\\Bilkent(ALLAHIN BELASI)\\Semester 6\\CS 465\\Projects\\Project 1\\Code\\marching-squares"
    },

    defaultGridSize: 40
};