# Dataviz2
A Data Visualization Project
Project 2: CITY OF AUSTIN DATA

TEAM COOLNAME:
Mike Barajas
Emily Cogsdill
Hetal Patel
Drupad Vaghela

Github: https://github.com/kenyanbapu/Dataviz2 



Data Source:

We will be plotting data from the City of Austin. There are two datasets under consideration:
Traffic data
https://data.austintexas.gov/Transportation-and-Mobility/Real-Time-Traffic-Incident-Reports/dx9v-zd7x 
	Pros: data are already clean
	Cons: not as cool as crime data
Crime data 
https://data.austintexas.gov/Public-Safety/APD-Incident-Extract-YTD/b4y9-5x39
Pros: more data, more interesting data
Cons: need to scrape to get lat/longs
SUPER BONUS STRETCH GOAL: use both datasets

We will begin development using Traffic data, and incorporate (or switch to) the crime data if and when we scrape the lat/longs for the addresses in that dataset.


Desired Output:

We will be creating an interactive dashboard that contains the following plots and filters:

Filters: 

Incident type: User selects from a dropdown menu to choose the type of traffic incidents they want to include in the dashboard.

Date range: User indicates start and end date of the data they want to include in the dashboard

Plots:

Map: For this we plan to find a new library, since there are a lot of libraries. We could map something like density of incidents for geographic areas (e.g., by zip code, with darker colors showing areas with higher rates of traffic incidents).

Line plots (accidents over time) - with sliders to select time periods (like we did with the stock thing using plotly)

Pie chart: Top 10 types of traffic incidents in the selected time period


Tasks

Data cleaning: already done for traffic data
lat/long scraping (Mike volunteers as tribute)
Setting up the database, flask API routes (Emily)
Javascript development (Hetal)
Create plots using Javascript (all of us?)
Map: Find a new library and plot a thing
Line charts: (Hetal)
Pie chart: (Emily)
Front-end development - make it look reasonable (Mike, ???)

