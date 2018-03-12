import pandas as pd 
import requests as req
import time
import datetime
import json
# from pymongo import Connection

url = "https://data.austintexas.gov/resource/r3af-2r8x.json?$limit=50000&$offset=0"

# if __name__ == "__main__":
#     con = Connection()
#     db.con.text_database
#     people = db.people

def get_data():
    # get the json from austin data api
    traffic_response = req.get(url)
    traffic_json = traffic_response.json()

    # append json into DataFrame
    df = pd.DataFrame(traffic_json)

    # Selecting specific columns needed
    clean_df = df[['address','issue_reported','location_latitude', 'location_longitude', 'published_date']]

    # Drop any NAN values and append to a list
    dropped = clean_df.dropna()
    newdate = dropped.loc[0:, 'published_date']
    listy = []
    for i in newdate:
        listy.append(i[0:10])

    #  delete old values for published_date and pass in new list to published_date column
    dropped = dropped.drop('published_date', axis=1)
    dropped['published_date'] = listy


    return dropped.to_dict(orient="records")

get_data()