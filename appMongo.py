from flask import Flask, render_template, jsonify
from pymongo import MongoClient
import json
from bson import json_util
from bson.json_util import dumps
import pandas as pd

app = Flask(__name__)

MONGODB_HOST = 'localhost'
MONGODB_PORT = 27017
DBS_NAME = 'austinincidents'
COLLECTION_NAME = 'incident'
FIELDS = {'_id': False, 'address': True, 'issue_reported': True, 'location_latitude': True, 'location_longitude': True, 'published_date': True}

@app.route('/')
def index():
    return render_template("index.html")

@app.route("/austin/data")
def austin_incidents():
    connection = MongoClient(MONGODB_HOST, MONGODB_PORT)
    collection = connection[DBS_NAME][COLLECTION_NAME]
    incidents = collection.find(projection=FIELDS)
    json_incidents = []
    for incident in incidents:
        json_incidents.append(incident)
    json_incidents = json.dumps(json_incidents, default=json_util.default)
    connection.close()
    return json_incidents

@app.route("/incident_types")
def incident_types():
    connection = MongoClient(MONGODB_HOST, MONGODB_PORT)
    collection = connection[DBS_NAME][COLLECTION_NAME]
    incidents = collection.distinct( "issue_reported" )
    json_incidents = []
    for incident in incidents:
        json_incidents.append(incident)
    json_incidents = json.dumps(json_incidents, default=json_util.default)
    connection.close()
    return json_incidents

@app.route("/dates")
def dates():
    connection = MongoClient(MONGODB_HOST, MONGODB_PORT)
    collection = connection[DBS_NAME][COLLECTION_NAME]
    dates = collection.distinct( "published_date" )
    json_dates = []
    for date in dates: 
        json_dates.append(date)
    json_dates = json.dumps(json_dates, default=json_util.default)
    connection.close()
    return json_dates 

@app.route("/api/v1.1/pie/")
def pieChartData():
    connection = MongoClient(MONGODB_HOST, MONGODB_PORT)
    collection = connection[DBS_NAME][COLLECTION_NAME]
    issues = collection.find(projection=FIELDS)
    df = pd.DataFrame(list(issues))
    top10=df[['issue_reported','location_latitude']].groupby(['issue_reported']).count().sort_values('location_latitude',ascending=False)[:10].reset_index().rename(columns={'Location':'Num Incidents'})
    json = top10.reset_index(drop=True)
    dictionary = json.to_dict(orient='records')
    connection.close()
    return jsonify(dictionary)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)