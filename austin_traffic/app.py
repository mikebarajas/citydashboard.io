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
import os 

MONGODB_URI = os.environ.get('MONGODB_URI')
if not MONGODB_URI:
    MONGODB_URI = "mongodb://user:qwe123!@ds117431.mlab.com:17431/heroku_phn1ffrt"

app = Flask(__name__)
connection = MongoClient(MONGODB_URI).get_database('heroku_phn1ffrt')

##########################################################################
####################  Creating the Database  #############################
##########################################################################
url = "https://data.austintexas.gov/resource/r3af-2r8x.json?$limit=50000&$offset=0"


traffic_response = req.get(url)
traffic_json = traffic_response.json()
time.sleep(1)

# append json into DataFrame
df = pd.DataFrame(traffic_json)
time.sleep(1)

# Selecting specific columns needed
clean_df = df[['address','issue_reported','latitude', 'longitude', 'published_date']]

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


data = json_util.loads(xyz.to_json(orient='records'))
db = connection.db
db.austinData.collection.remove()
time.sleep(1)
austinData = db.austinData
posts_id = austinData.collection.insert_many(data)



FIELDS = {'_id': False, 'address': True, 'issue_reported': True, 'latitude': True, 'longitude': True, 'published_date': True}

@app.route('/')
def index():
    return render_template("index.html")

@app.route("/austin/data")
def austin_incidents():
    incidents = austinData.collection.find(projection=FIELDS)
    json_incidents = []
    for incident in incidents:
        json_incidents.append(incident)
    json_incidents = json.dumps(json_incidents, default=json_util.default)
    return json_incidents

@app.route("/incident_types")
def incident_types():
    incidents = austinData.collection.distinct( "issue_reported" )
    json_incidents = []
    for incident in incidents:
        json_incidents.append(incident)
    json_incidents = json.dumps(json_incidents, default=json_util.default)
    return json_incidents

@app.route("/dates")
def dates():
    dates = austinData.collection.distinct( "published_date" )
    json_dates = []
    for date in dates: 
        json_dates.append(date)
    json_dates = json.dumps(json_dates, default=json_util.default)
    return json_dates 

@app.route("/api/v1.1/pie/")
def pieChartData():
    issues = austinData.collection.find(projection=FIELDS)
    df = pd.DataFrame(list(issues))
    top10=df[['issue_reported','latitude']].groupby(['issue_reported']).count().sort_values('latitude',ascending=False)[:10].reset_index().rename(columns={'Location':'Num Incidents'})
    json = top10.reset_index(drop=True)
    dictionary = json.to_dict(orient='records')
    return jsonify(dictionary)

@app.route("/calendar")
def calendar():
    issues = austinData.collection.find(projection=FIELDS)
    df = pd.DataFrame(list(issues))
    df['published_date'] = df['published_date'].str.replace('-',', ')
    calendar=df[['published_date','issue_reported']].groupby(['published_date']).count().rename(columns={'Location':'Num Incidents'})
    json = calendar.reset_index()
    dictionary = json.to_dict(orient='records')
    return jsonify(dictionary)


# Heroku Mode
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get('PORT')))

#  Home Mode
# if __name__ == "__main__":
#     app.run(host="0.0.0.0", port=5000)