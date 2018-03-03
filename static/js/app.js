
function init() {
    getData();
    buildDropdown();
    BuildPieChart();
    // buildCharts();
};

init();

function getData() {
    // Use a request to grab the entire data set
    Plotly.d3.json("/api/v1.1/", function(error, data) {
        if (error) return console.warn(error);
        // need to set timeout conditional on data loading
        buildGraphdivs(data)
        console.log(parseTime(data));
        // reduceTime(data);
    });
};


function buildDropdown() {
    var selDataset = document.getElementById("selDataset");

    Plotly.d3.json('/incident_types', function(error, data){
        if (error) return console.warn(error);
        for (i = 0; i < data.length; i++) {
                    IncidentType=data[i]
                    var selDatasetItem = document.createElement("option");
                    selDatasetItem.text=IncidentType;
                    selDatasetItem.value=IncidentType;
                    selDataset.appendChild(selDatasetItem);
                }
    });
};

function BuildPieChart() {
    Plotly.d3.json('/api/v1.1/pie/', function(error, data) {
        if (error) return console.warn(error);

       labels=[]
       values=[]
       for (i = 0; i < 10; i++) {
           labels.push(data['Issue Reported'][i].toString())
           values.push(+data['Num Incidents'][i])
       };

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
              r: 10, 
              t: 50, 
              b: 50, 
              l: 0
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
    console.log(incident_type)
    // Use a request to grab the json data needed for all charts
    Plotly.d3.json("/api/v1.1/", function(error, data) {
        if (error) return console.warn(error);
        var userOption = []
        data.reduce(function(all, x, index) {
            if (x['Issue Reported'].toLowerCase() == incident_type.toLowerCase()) {
                userOption.push(x);
            }
            return userOption;
            console.log(reduceDate(userOption))
            console.log(reduceTime(userOption))
        })
    buildGraphdivs(userOption)
    })
};

function parseTime(data) {
    var parsedTime = [];
    for (i = 0; i < data.length; i++) { 
        var time = new Date(data[i]["Published Date"]);
        var hour = time.getUTCHours();
        var day = time.getUTCDay();
        var month = time.getUTCMonth();
        var incident = data[i]["Issue Reported"];
        parsedTime.push({"Incident": incident, "Hour": hour,"Day": day, "Month": month});
        }
    console.log(buildCharts(parsedTime));
    buildCharts(parsedTime);
    return parsedTime;
        
    
    console.log(parsedTime);
    
};

function buildCharts(arr) {
    console.log(arr)
    return arr.reduce(function(dateArray, x) {
        var dateString = x["Hour"]
        if (dateArray[dateString] !== undefined) {
            dateArray[dateString].push(x)
        } else {
            dateArray[dateString] = [x]
        }
        console.log(buildCharts2(dateArray))
        return dateArray
    })
}

function buildCharts2(data) {
    graphData = []
    for (i = 0; i < 10; i++) { 
        console.log(data[i])
        console.log(data[I].length)
    return graphData
    }
    console.log(graphData)

}



function reduceDate (arr) {
    return arr.reduce(function(dateArray, x) {
        var dateString = new Date(x['Published Date']).toISOString().slice(0, 10)
        if (dateArray[dateString] !== undefined) {
            dateArray[dateString].push(x)
        } else {
            dateArray[dateString] = [x]
        }

        return dateArray
    })
    
};


function reduceTime (arr) {
    console.log(arr)
    var byHour = []
    console.log("By Hour:   "+ byHour);
    arr.reduce(function(timeArray, x) {
        var timeString = new Date(x['Published Date']).toISOString().slice(11,13)
        if (timeArray[timeString] !== undefined) {
            timeArray[timeString].push(x)
        } else {
            timeArray[timeString] = [x]
        }

        for (i = 0; i < timeArray.length; i++) { 
            byHour.push(timeArray[key], timeArray.length)
            console.log(byHour)}
        return timeArray
        
    })
    console.log(byHour);
}

function buildGraphdivs(data) {
    d3.select("#mapid").remove();
    d3.select("#rawData").remove();
    d3.select("#mapContainer").html('<div id="mapid" class="map" style="width: 100%; height: 500px; border: 3px solid #AAA;"></div>');
    d3.select("#insertTable").html('<table id="rawData" class="display" width="100%"></table>');
    buildMap(data);
    buildTable(data);

};

function buildMap(data) {

    var lat = [];
    var lon = [];
    var incident = [];
    
    for (i = 0; i < data.length; i++) { 
        lat.push(data[i].Latitude);
        lon.push(data[i].Longitude);
        incident.push(data[i]["Issue Reported"])}
    

    var mymap = L.map('mapid').setView([30.27, -97.74], 10);
    L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(mymap);

    // Creating a new marker cluster group
    var markers = L.markerClusterGroup();

    // Loop through our data...
    for (var i = 0; i < lat.length; i++) {
        if (lat[i] > 0 && -98 > lon[i] > -88) {
        markers.addLayer(L.marker([lat[i], lon[i]])
            .bindPopup(incident[i]));}
    }
    
    // Add our marker cluster layer to the map
    mymap.addLayer(markers);
};

function buildTable(data) {
    var tableArray =[];
    
    for (i = 0; i < data.length; i++) { 
        tableArray.push([data[i]["Issue Reported"], data[i]["Published Date"], data[i]["Address"], data[i]["Location"]])
    }

    $(document).ready(function() {
        $('#rawData').DataTable( {
            data: tableArray,
            columns: [
                { title: "Incident" },
                { title: "Date" },
                { title: "Address" },
                { title: "Location" }
            ]
        } );
    } );
};

