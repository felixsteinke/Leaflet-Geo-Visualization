/*
Example Data
 */
projects = [
    new StudProjects("BPS", "WS0708", "SAP-Projekte", "Bosch", "Wernerstraße 51, 70469 Stuttgart-Feuerbach, Deutschland", 48.8134841, 9.1623697),
    new StudProjects("BPS", "WS0708", "SAP-Prozesse Logistik", "Bosch", "Franz-Oechsle-Straße 4, 73207 Plochingen, Deutschland", 48.71727, 9.40928),
    new StudProjects("BT", "WS0809", "Erstellung eines Konzepts fast- und Performancetests fas System der Daimler Fleetboard GmbH", "Daimler Fleetboard GmbH", "Am Wallgraben 125, 70567 Stuttgart, Deutschland", 48.72362, 9.12213)
];

coordsJson = [];

markerBlue = L.layerGroup([]);
markerPurple = L.layerGroup([]);
markerGreen = L.layerGroup([]);
markerRed = L.layerGroup([]);
markerBlack = L.layerGroup([]);

markerBachelorThesis = L.layerGroup([]);
markerBPS = L.layerGroup([]);


/*
Load the map
 */

var map;

function initialize() {
    fillProjects();
    var center = L.latLng(48.81, 9.16); // Stuttgart
    var zoom = 10;
    map = L.map('map_canvas').setView(center, zoom);

    var osm = new L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: 'Map data © <a href="https://openstreetmap.org">OpenStreetMap</a> contributors',
        minZoom: 2,
        maxZoom: 18
    });
    L.Control.geocoder().addTo(map);
    map.addLayer(osm);
    for (var i = 0; i < projects.length; i++) {
        markLocation(projects[i])
    }
    let overlay = {
        "Blau - WS0910": markerBlue,
        "Lila - WS0809": markerPurple,
        "Gruen - WS0708": markerGreen,
        "Rot - SS10": markerRed,
        "Schwarz - noData": markerBlack,

        "Bachelor Thesis": markerBachelorThesis,
        "BPS": markerBPS,
    }

    L.control.layers(null, overlay).addTo(map);
}

/*
Create a marker
 */
function markLocation(project) {
    if (project.semester === "WS0910") {
        markerBlue.addLayer(createMarker(project, "blue"));
    } else if (project.semester === "WS0809") {
        markerPurple.addLayer(createMarker(project, "purple"));
    } else if (project.semester === "WS0708") {
        markerGreen.addLayer(createMarker(project, "green"));
    } else if (project.semester === "SS10") {
        markerRed.addLayer(createMarker(project, "red"));
    } else {
        markerBlack.addLayer(createMarker(project, "black"));
    }

}

function createMarker(project, color) {
    let marker = L.marker(project.coordinates, {
        title: project.company,
        icon: createIcon(project.job, color)
    }).addTo(map)
        .bindPopup("<b>" + project.company + "</b><br>" + project.description);
    if (project.job === "BPS") {
        markerBPS.addLayer(marker);
    } else if (project.job === "BT") {
        markerBachelorThesis.addLayer(marker);
    }
    return marker;
}

function getIconUrl(job, color) {
    let svg;
    if (job === "BPS") {
        svg = `<svg xmlns="http://www.w3.org/2000/svg" enable-background="new 0 0 24 24" viewBox="0 0 24 24" fill="${color}" width="36px" height="36px"><g><rect fill="none" height="24" width="24"/></g><g><g><g><path d="M21.67,18.17l-5.3-5.3h-0.99l-2.54,2.54v0.99l5.3,5.3c0.39,0.39,1.02,0.39,1.41,0l2.12-2.12 C22.06,19.2,22.06,18.56,21.67,18.17z"/></g><g><path d="M17.34,10.19l1.41-1.41l2.12,2.12c1.17-1.17,1.17-3.07,0-4.24l-3.54-3.54l-1.41,1.41V1.71L15.22,1l-3.54,3.54l0.71,0.71 h2.83l-1.41,1.41l1.06,1.06l-2.89,2.89L7.85,6.48V5.06L4.83,2.04L2,4.87l3.03,3.03h1.41l4.13,4.13l-0.85,0.85H7.6l-5.3,5.3 c-0.39,0.39-0.39,1.02,0,1.41l2.12,2.12c0.39,0.39,1.02,0.39,1.41,0l5.3-5.3v-2.12l5.15-5.15L17.34,10.19z"/></g></g></g></svg>`
    } else if (job === "BT") {
        svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" width="36px" height="36px"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M19 3H5v12.93l7 4.66 7-4.67V3zm-9 13l-4-4 1.41-1.41 2.58 2.58 6.59-6.59L18 8l-8 8z" opacity=".05"/><path d="M19 1H5c-1.1 0-1.99.9-1.99 2L3 15.93c0 .69.35 1.3.88 1.66L12 23l8.11-5.41c.53-.36.88-.97.88-1.66L21 3c0-1.1-.9-2-2-2zm-7 19.6l-7-4.66V3h14v12.93l-7 4.67zm-2.01-7.42l-2.58-2.59L6 12l4 4 8-8-1.42-1.42z"/></svg>`
    }
    return encodeURI("data:image/svg+xml," + svg).replace('#', '%23');
}

function createIcon(job, color) {
    return L.icon({
        iconUrl: getIconUrl(job, color),
        iconSize: [32, 42], // size of the customIcon
        iconAnchor: [0, 32], // point of the customIcon which will correspond to marker's location
        popupAnchor: [0, -32] // point from which the popup should open relative to the iconAnchor
    });
}

/*
Read CSV-Data
 */

function fillProjects() {
    fillCoordsJson();
    $(document).ready(function () {
        $.ajax({
            type: "GET",
            async: false,
            url: "./resources/Target_GVI-03-Ubung_3_Adressen.csv",
            dataType: "text",
            success: function (data) {
                processProjects(data);
            },
            error: function (error) {
                //console.log(error);
            }
        });
        console.log(projects);
    });
}

function fillCoordsJson() {
    $(document).ready(function () {
        $.ajax({
            type: "GET",
            async: false,
            url: "./resources/Target_JsonResponse",
            dataType: "text",
            success: function (data) {
                processCoordsJson(data);
            },
            error: function (error) {
                //console.log(error);
            }
        });
        console.log(coordsJson);
    });
}

/*
Proceed the CSV
 */
function processCoordsJson(allText) {
    var allJsonLines = allText.split(/\r\n|\n/);
    for (var i = 0; i < allJsonLines.length; i++) {
        coordsJson.push(JSON.parse(allJsonLines[i])[0]);
    }
}

function processProjects(allText) {
    var allTextLines = allText.split(/\r\n|\n/);

    for (var i = 0; i < allTextLines.length; i++) {
        var data = allTextLines[i].split(';');
        //Filter für korrupte Daten
        if (data[0] === undefined || data[1] === undefined || data[2] === undefined || data[3] === undefined || data[4] === undefined) {
            continue;
        }
        var coord = coordsJson[i];
        if (coord === undefined) {
            continue;
        }
        var project = new StudProjects(data[0], data[1], data[2], data[3], data[4], coord.lat, coord.lon);
        projects.push(project);
        markLocation(project);
    }
}

/*
Call GET for the Coordinates

My IP-address got banned on this site, so i needed to write the respones into the Target_JsonResponse. I got them with the HfT-Proxy.
 */

function callGetCoords(address) {
    const geocodeUrl = 'https://nominatim.openstreetmap.org/search?q=';
    const geocodeParams = '&format=json&limit=1'
    $(document).ready(function () {
        $.ajax({
            url: geocodeUrl + address + geocodeParams,
            type: "GET",
            success: function (result) {
                return result;
            },
            error: function (error) {
                //console.log(error);
            }
        })
    });
}

/*
StudProject Object
 */

function StudProjects(job, semester, content, company, address, coordLat, coordLng) {
    // Attribute
    this.job = job;
    this.semester = semester;
    this.content = content;
    this.company = company;
    this.address = address;
    // Methoden
    this.coordinates = L.latLng(coordLat, coordLng);
    this.description = this.job + "," + this.semester + " bei " + this.company + " für " + this.content + " in " + this.address;
}


