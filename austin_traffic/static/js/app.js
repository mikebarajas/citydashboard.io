function init() {
    getData();
    buildDropdown();
    BuildPieChart();
};

init();

function getData() {
    // Use a request to grab the entire data set
    Plotly.d3.json("austin/data", function(error, data) {
        if (error) return console.warn(error);
        // need to set timeout conditional on data loading
        buildGraphdivs(data);
        buildCalendar()
    });
};


function buildDropdown() {
    var selDataset = document.getElementById("selDataset");

    Plotly.d3.json('incident_types', function(error, data){
        if (error) return console.warn(error);
        for (i = 0; i < data.length; i++) {
                    IncidentType=data[i];
                    var selDatasetItem = document.createElement("option");
                    selDatasetItem.text=IncidentType;
                    selDatasetItem.value=IncidentType;
                    selDataset.appendChild(selDatasetItem);
                };
    });
};




function buildCalendar() {
    Plotly.d3.json("calendar", function(error, data) {
        if (error) return console.warn(error);
        
    var tableArray =[];
    for (i = 0; i < data.length; i++) { 
        tableArray.push([new Date(data[i]["published_date"]), data[i]["issue_reported"]]);
    }
    drawChart(tableArray)

})};

google.charts.load("current", {packages:["calendar"]});
google.charts.setOnLoadCallback(drawChart);

function drawChart(data) {
    var dataTable = new google.visualization.DataTable();
    dataTable.addColumn({ type: 'date', id: 'Date' });
    dataTable.addColumn({ type: 'number', id: 'Number of Traffic Issues' });

   
    var tableArray =[];
   



    dataTable.addRows(
        data
    );
    
    var chart = new google.visualization.Calendar(document.getElementById('calendar_basic'));

    var options = {
      title: "Traffic Issue Calendar",
      height: 350,
      calendar: {
        monthLabel: {
          fontName: 'Times-Roman',
          fontSize: 16,
          color: 'green',
          bold: true,
          italic: false
        }
      }
      };

    chart.draw(dataTable, options);
}



function BuildPieChart() {
    Plotly.d3.json('api/v1.1/pie/', function(error, data) {
        if (error) return console.warn(error);
       labels=[];
       values=[];
       for (i = 0; i < 10; i++) {
           labels.push(data[i]['issue_reported'].toString());
           values.push(+data[i]['latitude']);
       }

        var pieData = [{
            direction: 'counterclockwise', 
            hole: 0.7, 
            labels: labels,
            marker: {
              colors: ['rgb(255, 255, 204)', 'rgb(161, 218, 180)', 'rgb(65, 182, 196)', 'rgb(44, 127, 184)', 'rgb(8, 104, 172)', 'rgb(37, 52, 148)'], 
              line: {width: 1}
            }, 
            pull: 0.02, 
            rotation: 0, 
            sort: true, 
            textfont: {
              family: 'Droid Serif', 
              size: 16
            }, 
            textinfo: 'percent', 
            textposition: 'outside', 
            type: 'pie', 
            uid: '88d92e', 
            values: values, 
          }];

        var pieLayout = {
            autosize: true, 
            font: {
              family: '"Open Sans", verdana, arial, sans-serif', 
              size: 15
            }, 
            height: 675, 
            legend: {
              x: 0.374001448087, 
              y: 0.71051567555, 
              bgcolor: 'rgb(255, 255, 255)', 
              borderwidth: 2, 
              font: {
                color: '#000', 
                family: 'Helvetica, sans-serif', 
                size: 15
              }, 
              orientation: 'v'
            }, 
            margin: {
              r: 150, 
              t: 50, 
              b: 50, 
              l: 50
            }, 
            paper_bgcolor: 'rgb(255, 255, 255)', 
            titlefont: {
              color: '#000', 
              family: 'Overpass', 
              size: 58
            }, 
            width: 850
          };
        var PIE = document.getElementById('pie');
        Plotly.plot(PIE, pieData, pieLayout);
    });

};
     
function optionChanged(incident_type) {
    // Use a request to grab the json data needed for all charts
    Plotly.d3.json("austin/data", function(error, data) {
        if (error) return console.warn(error);
        var userOption = []
        data.reduce(function(all, x, index) {
            if (x['issue_reported'].toLowerCase() == incident_type.toLowerCase()) {
                userOption.push(x);
            }
            return userOption;
        })
    buildGraphdivs(userOption)
    })
};

function buildGraphdivs(data) {
    d3.select("#mapid").remove();
    d3.select("#rawData").remove();
    d3.select("#mapContainer").html('<div id="mapid" class="map" style="width: 100%; height: 800px; border: 3px solid #AAA;"></div>');
    d3.select("#insertTable").html('<table id="rawData" class="display" style="width: 90%; height: 800px; padding: 4px solid #AAA;"></table>');
    buildMap(data);
    buildTable(data);

};

function buildMap(data) {

    var lat = [];
    var lon = [];
    var incident = [];
    
    for (i = 0; i < data.length; i++) { 
        lat.push(data[i].latitude);
        lon.push(data[i].longitude);
        incident.push(data[i]["issue_reported"])}
    
        // Define streetmap and darkmap layers
    var streetmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/outdoors-v10/tiles/256/{z}/{x}/{y}?" +
    "access_token=pk.eyJ1Ijoia2pnMzEwIiwiYSI6ImNpdGRjbWhxdjAwNG0yb3A5b21jOXluZTUifQ." +
    "T6YbdDixkOBWH_k9GbS8JQ");

    var satalitemap = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
    });

    // Define a baseMaps object to hold our base layers
    var baseMaps = {
        "Satelite View": satalitemap,
        "Street Map": streetmap
    };

    // Make map title layer
    var mymap = L.map('mapid', {
        center: [30.27, -97.74],
        zoom: 10,
        layers: [satalitemap, streetmap],
        minZoom: 10,
        scrollWheelZoom: false

    })

    // Creating a new marker cluster group
    var markers = L.markerClusterGroup();

    // Loop through our data...
    for (var i = 0; i < lat.length; i++) {
        if (lat[i] > 0 && -98 > lon[i] > -88) {
        markers.addLayer(L.marker([lat[i], lon[i]])
            .bindPopup(incident[i]));}
    }
    
      // Creating a geoJSON layer with the retrieved data
    var geoJson = L.geoJson(districts, {
        color: "white",
        fillOpacity: 0.5,
        weight: 1.5
    });


    // Add our marker cluster layer to the map
    mymap.addLayer(markers);
    
    var overlays = {
        "Traffic Incidents": markers,
        "Jurisdiction Boundaries": geoJson
      };

    // Create a layer control
    // Pass in our baseMaps and overlayMaps
    // Add the layer control to the map
    L.control.layers(baseMaps, overlays, {
        collapsed: false
    }).addTo(mymap);
};

function buildTable(data) {
    var tableArray =[];
    for (i = 0; i < data.length; i++) { 
        tableArray.push([data[i]["issue_reported"], data[i]["published_date"], data[i]["address"], data[i]["latitude"], data[i]["longitude"]]);
    }
    $(document).ready(function() {
        $('#rawData').DataTable( {
            data: tableArray,
            columns: [
                { title: "Incident" },
                { title: "Date" },
                { title: "Address" },
                { title: "Latitude" },
                { title: "Longitude" }
            ]
        } );
    } );
};

