import pandas as pd 
import requests as req
import time
import datetime
import json
from flask_pymongo import PyMongo
import os 

MONGODB_URI = os.environ.get('MONGODB_URI')
if not MONGODB_URI:
    MONGODB_URI = "mongodb://localhost:27017/austinDB"

app.config['MONGO_URI'] = MONGODB_URI
mongo = PyMongo(app)
# from pymongo import Connection

def scrape():

    url = "https://data.austintexas.gov/resource/r3af-2r8x.json?$limit=50000&$offset=0"

    # def get_data():
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
    time.sleep(2)

    #  delete old values for published_date and pass in new list to published_date column
    xyz = dropped.drop('published_date', axis=1)
    xyz['published_date'] = listy
    time.sleep(2)


    MONGODB_HOST = 'localhost'
    MONGODB_PORT = 27017
    DBS_NAME = 'austinDB'
    COLLECTION_NAME = 'austinData'
    data = json_util.loads(xyz.to_json(orient='records'))
    connection = MongoClient(MONGODB_HOST, MONGODB_PORT)
    db = connection.austinDB
    austinData = db.austinData
    posts_id = austinData.insert_many(data)

    return data