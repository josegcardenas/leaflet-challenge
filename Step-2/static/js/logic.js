var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson";

// Get request with .then to avoid time out
d3.json(queryUrl).then(function(response) { 
  

  //Create onEach function after info received
  features = response.features

  function onEachFeature(featureData, layer) {
      layer.bindPopup("<h3>" + featureData.properties.place +
        "</h3><hr><p>" + new Date(featureData.properties.time) + "</p>"); 
  }

  var earthquakes = L.geoJSON(features, {
    onEachFeature: onEachFeature,

    pointToLayer: (featureData, latlng) => {
      return L.circle(latlng,
        {radius: featureData.properties.mag*100000,
        fillColor: colorFILL(featureData.geometry.coordinates[2]),
        fillOpacity: 0.5,
        opacity: 9,
        color: "black"
      }
        )
  }
  });
  
    function colorFILL(depth) {
      console.log("depth:",depth)
        if (depth > 90){color = "#E62817";}
        
        else if (depth > 70){color = "#E66317";}
        
        else if (depth > 50){color = "#E6CA17";}
        
        else if (depth > 30){color = "#D4EE00";}
        
        else if (depth > 10){color = "#78E617";}
        
        else {color = "#17E6DF";}
      return color
   }

  // Define streetmap and darkmap layers
  var streetmap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: "mapbox/streets-v11",
    accessToken: API_KEY
  });

  var tectonicplates = new L.LayerGroup();

  // Define a baseMaps object to hold our base layers
  var baseMaps = {
    "Street Map": streetmap,
    "Outdoors" : outdoors
  };


  // Create overlay object to hold our overlay layer
  var overlayMaps = {
    Earthquakes : earthquakes,
    "Tectonic Plates" : tectonicplates
  };
  d3.json("https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json").then(function(platedata) {
    L.geoJson(platedata, {
        color: "orange",
        weight: 2
      })
      .addTo(tectonicplates);
  // Create our map to display on load
  var myMap = L.map("map", {
    center: [
      25, -20.71
    ],
    zoom: 3,
    layers: [streetmap, earthquakes]
  });

  // Create layer control
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

  // legend at bottom right corner
  var legend = L.control({
    position: "bottomleft"
  });
  legend.addTo(myMap);


  legend.onAdd = function () {
    var div = L.DomUtil.create("div", "info legend");
    var altitude = [-10, 10, 30, 50, 70, 90];
    var colors = [
        "#17E6DF",
        "#78E617",
        "#D4EE00",
        "#E6CA17",
        "#E66317",
        "#E62817"
    ];
    // generate a legend with a colored square for each interval.
    for (var i = 0; i < altitude.length; i++) {
        div.innerHTML += "<i style='background: " + colors[i] + "'></i> "
            + altitude[i] + (altitude[i + 1] ? "&ndash;" + altitude[i + 1] + "<br>" : "+");
    }
    return div;
  };
  // legend to the map.
  });

});
