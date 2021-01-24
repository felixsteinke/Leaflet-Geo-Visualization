//data from: https://geojson-maps.ash.ms/
const geoJsonPath = '../resources/europe.geo.json';

let map;
let openStreetMapLayer;
let geojson;

let populationEdges;
let showPopulationDensity = true;
let useClassColors = true;

function initialize() {
    /*
    Initialize Map
     */
    map = L.map('map_canvas').setView([48.81, 9.16], 4);
    openStreetMapLayer = new L.TileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: 'Map data © <a href="https://openstreetmap.org">OpenStreetMap</a> contributors',
        minZoom: 2,
        maxZoom: 18
    });
    map.addLayer(openStreetMapLayer);

    /*
    Initialize GeoJson
     */
    $.get(
        geoJsonPath, function (data) {
            console.log(data);
            populationEdges = getMinAndMaxPop(data);

            geojson = L.geoJson(data, {
                style: style,
                onEachFeature: onEachFeature
            }).addTo(map);
            loadLegend();
        }
    );
}

/*
GeoJson Properties
 */
function style(feature) {
    return {
        weight: 2,
        opacity: 1,
        color: 'white',
        dashArray: '3',
        fillOpacity: 0.7,
        fillColor: getColor(feature)
    };
}

function onEachFeature(feature, layer) {
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
        click: zoomToFeature
    });
}

function highlightFeature(e) {
    let layer = e.target;
    layer.setStyle({
        weight: 5,
        color: '#666',
        dashArray: '',
        fillOpacity: 0.7
    });
    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
        layer.bringToFront();
    }
    //info.update(layer.feature.properties);
}

function resetHighlight(e) {
    geojson.resetStyle(e.target);
    //info.update();
}

function zoomToFeature(e) {
    map.fitBounds(e.target.getBounds());
}

/*
Btn Functions
 */
function changeColorScheme() {
    useClassColors = !useClassColors;
    //button
    let buttonText;
    if (useClassColors) {
        buttonText = 'Change to Gradient Color';
    } else {
        buttonText = 'Change to Class Color';
    }
    document.getElementById("btnColorScheme").innerText = buttonText;
    refresh();
}

function changeDisplacedData() {
    showPopulationDensity = !showPopulationDensity;
    //button
    let buttonText;
    if (showPopulationDensity) {
        buttonText = 'Change to total Population View';
    } else {
        buttonText = 'Change to Population Density in 1/km^2 View';
    }
    document.getElementById("btnDisplayedData").innerText = buttonText;
    refresh();
}

/*
Color Functions
 */
function refresh() {
    //map
    geojson.resetStyle();
    //legend
    loadLegend();
}

function loadLegend() {
    let legendTitle;
    let maxScale = "";
    let minScale = "";
    let colorImage;
    if (showPopulationDensity) {
        legendTitle = 'Population-Density in 1/km^2';
        if (!useClassColors) {
            maxScale = 'Maximum: ' + parseInt(populationEdges.maxPopulationDensity);
            minScale = 'Minimum: ' + parseInt(populationEdges.minPopulationDensity);
            colorImage = "../resources/gradientScale.png";
        } else {
            colorImage = "../resources/classScaleDensity.png";
        }
    } else {
        legendTitle = 'Total Population';
        if (!useClassColors) {
            maxScale = 'Maximum: ' + parseInt(populationEdges.maxPopulation);
            minScale = 'Minimum: ' + parseInt(populationEdges.minPopulation);
            colorImage = "../resources/gradientScale.png";
        } else {
            colorImage = "../resources/classScaleTotalPopulation.png";
        }
    }
    document.getElementById("legendTitle").innerText = legendTitle;
    document.getElementById("maxScale").innerText = maxScale;
    document.getElementById("minScale").innerText = minScale;
    document.getElementById("colorImg").src = colorImage;
}

function getColor(feature) {
    let area = getAreaFromGeometry(feature.geometry); //in m^2
    let population = feature.properties.pop_est;
    let populationDensity = population / (area / 1_000_000); //in km^2
    if (showPopulationDensity) {
        if (useClassColors) {
            return populationDensity > 350 ? '#800026' :
                populationDensity > 230 ? '#BD0026' :
                    populationDensity > 190 ? '#E31A1C' :
                        populationDensity > 140 ? '#FC4E2A' :
                            populationDensity > 110 ? '#FD8D3C' :
                                populationDensity > 70 ? '#FEB24C' :
                                    populationDensity > 40 ? '#FED976' :
                                        '#FFEDA0';
        } else {
            let percentage = (populationDensity - populationEdges.minPopulationDensity) / (populationEdges.maxPopulationDensity - populationEdges.minPopulationDensity) * 100;
            return hslToHex(360, percentage, 50);
        }
    } else {
        if (useClassColors) {
            return population > 60000000 ? '#800026' :
                population > 50000000 ? '#BD0026' :
                    population > 40000000 ? '#E31A1C' :
                        population > 30000000 ? '#FC4E2A' :
                            population > 20000000 ? '#FD8D3C' :
                                population > 10000000 ? '#FEB24C' :
                                    population > 1000000 ? '#FED976' :
                                        '#FFEDA0';
        } else {
            let percentage = (population - populationEdges.minPopulation) / (populationEdges.maxPopulation - populationEdges.minPopulation) * 100;
            return hslToHex(360, percentage, 50);
        }
    }
}

function hslToHex(h, s, l) {
    h /= 360;
    s /= 100;
    l /= 100;
    let r, g, b;
    if (s === 0) {
        r = g = b = l; // achromatic
    } else {
        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        };
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
    }
    const toHex = x => {
        const hex = Math.round(x * 255).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    };
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/*
Data Functions
 */
function getAreaFromGeometry(geometry) {
    return turf.area(geometry);
}

function getMinAndMaxPop(data) {
    let minPopulation = Number.MAX_SAFE_INTEGER;
    let maxPopulation = 0;
    let minPopulationDensity = Number.MAX_SAFE_INTEGER;
    let maxPopulationDensity = 0;

    data.features.forEach(feature => {
        let area = getAreaFromGeometry(feature.geometry); //in m^2
        let population = feature.properties.pop_est;
        let populationDensity = population / (area / 1_000_000); //in km^2
        if (minPopulation > population) {
            minPopulation = population;
        }
        if (maxPopulation < population) {
            maxPopulation = population;
        }
        if (minPopulationDensity > populationDensity) {
            minPopulationDensity = populationDensity;
        }
        if (maxPopulationDensity < populationDensity) {
            maxPopulationDensity = populationDensity;
        }
    });
    return {minPopulation, maxPopulation, minPopulationDensity, maxPopulationDensity};
}


