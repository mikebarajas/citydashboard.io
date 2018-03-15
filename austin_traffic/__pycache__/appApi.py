from flask import Flask, render_template, jsonify
from pymongo import MongoClient
import sys, json
from bson import json_util
from bson.json_util import dumps
import pandas as pd
import time
import requests as req
import time
import datetime
from flask_pymongo import PyMongo
import os 

# Connect to mLab
MONGODB_URI = os.environ.get('MONGODB_URI')
if not MONGODB_URI:
    MONGODB_URI = "mongodb://localhost:27017/austinDB"

# Initialize Flask
app = Flask(__name__)
app.config['MONGO_URI'] = MONGODB_URI
mongo = PyMongo(app)

def json_scrape():
    url = "https://data.austintexas.gov/resource/r3af-2r8x.json?$limit=50000&$offset=0"

    # get the json from austin data api
    traffic_response = req.get(url)
    traffic_json = traffic_response.json()
    time.sleep(1)

    # append json into DataFrame
    df = pd.DataFrame(traffic_json)
    time.sleep(1)

    # Selecting specific columns needed
    clean_df = df[['address','issue_reported','location_latitude', 'location_longitude', 'published_date']]

    # Drop any NAN values and append to a list
    dropped = clean_df.dropna()
    newdate = dropped.loc[0:, 'published_date']
    listy = []
    for i in newdate:
        listy.append(i[0:10])
    time.sleep(1)

    #  delete old values for published_date and pass in new list to published_date column
    xyz = dropped.drop('published_date', axis=1)
    xyz['published_date'] = listy
    time.sleep(1)

    return xyz






FIELDS = {'_id': False, 'address': True, 'issue_reported': True, 'location_latitude': True, 'location_longitude': True, 'published_date': True}

@app.route('/')
def index():
    return render_template("index.html")

@app.route("/austin/data")
def austin_incidents():
    collection = mongo.db.blah
    incidents = collection.find(projection=FIELDS)
    json_incidents = []
    for incident in incidents:
        json_incidents.append(incident)
    json_incidents = json.dumps(json_incidents, default=json_util.default)
    # connection.close()
    return json_incidents

@app.route("/incident_types")
def incident_types():
    collection = mongo.db.blah
    incidents = collection.distinct( "issue_reported" )
    json_incidents = []
    for incident in incidents:
        json_incidents.append(incident)
    json_incidents = json.dumps(json_incidents, default=json_util.default)
    connection.close()
    return json_incidents

@app.route("/dates")
def dates():
    collection = mongo.db.blah
    dates = collection.distinct( "published_date" )
    json_dates = []
    for date in dates: 
        json_dates.append(date)
    json_dates = json.dumps(json_dates, default=json_util.default)
    connection.close()
    return json_dates 

@app.route("/api/v1.1/pie/")
def pieChartData():
    collection = mongo.db.blah
    issues = collection.find(projection=FIELDS)
    df = pd.DataFrame(list(issues))
    top10=df[['issue_reported','location_latitude']].groupby(['issue_reported']).count().sort_values('location_latitude',ascending=False)[:10].reset_index().rename(columns={'Location':'Num Incidents'})
    json = top10.reset_index(drop=True)
    dictionary = json.to_dict(orient='records')
    connection.close()
    return jsonify(dictionary)

if __name__ == "__main__":
    app.run(debug=True)