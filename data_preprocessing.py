import pandas as pd
from datetime import datetime

data=pd.read_csv("DataSources/traffic_data.csv")

#filter out any null date values
data=data[data['Published Date'].notnull()]

dates=data['Published Date']

dates_as_integer=[]

for date in dates:
    try:
        datetimeobject=datetime.strptime(date.split(" ")[0],'%m/%d/%Y')
        dates_as_integer.append(datetimeobject.strftime("%Y%m%d"))
    except AttributeError:
        dates_as_integer.append(None)

data['Published Date as Integer']=dates_as_integer

data.to_csv("DataSources/traffic_data_clean.csv")