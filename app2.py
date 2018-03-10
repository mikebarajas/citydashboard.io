from flask import Flask
from flask import render_template
from pymongo import MongoClient
import json
from bson import json_util
from bson.json_util import dumps

app = Flask(__name__)

MONGODB_HOST = 'localhost'
MONGODB_PORT = 27017
DBS_NAME = 'austindb'
COLLECTION_NAME = 'austinData'
# selecting which fields you want from mongoDB (excludes lat and lng)
FIELDS = {'_id': False, 'id': True, 'address': True, 'issue_reported': True, 'location_latitude': True, 'location_longitude': True, 'published_date': True}

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

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)