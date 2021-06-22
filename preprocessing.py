import json

import pandas as pd
from sklearn.cluster import KMeans

csv_data = pd.read_csv("static/data/covid_us.csv")
pcp_df = pd.read_csv("static/data/covid_us.csv", usecols=[2, 3, 6, 8, 11])
f = open("static/data/statesgeoNoAlaska.json")
map_json = json.load(f)
f.close()


def get_statewise_total_cases_till(end_date, selected_column):
    global csv_data
    csv_data['submission_date'] = pd.to_datetime(csv_data['submission_date'], format="%Y-%m-%d")
    csv_data = csv_data.sort_values(by="submission_date")
    total_cases = csv_data[(csv_data['submission_date'] == end_date)]
    return total_cases[['submission_date', 'state', selected_column]]


def get_statewise_total_cases_data(end_date, selected_column):
    df = get_statewise_total_cases_till(end_date, selected_column)
    map = map_json
    for i in range(len(map['features'])):
        map['features'][i]['properties'][selected_column] = \
            df[(df['state'] == map['features'][i]['properties']['STUSPS'])][selected_column].values.tolist()[0]
        # print(df[(df['state'] == map['features'][i]['properties']['STUSPS'])]['tot_cases'].values.tolist())
    return json.dumps(map)


def get_country_cases(start_date, end_date, column):
    global csv_data
    df = csv_data.loc[((csv_data['submission_date'] <= end_date) & (csv_data['submission_date'] >= start_date))]
    json = df.groupby(['submission_date']).sum()[[column]].to_json(orient='table')
    # print(json)
    return json


def get_states_cases(states, start_date, end_date, column):
    global csv_data
    df = csv_data.loc[((csv_data['submission_date'] <= end_date) & (csv_data['submission_date'] >= start_date))]
    json = df[(df['state'].isin(states))].groupby(['submission_date']).sum()[[column]].to_json(orient='table')
    return json


def get_all_stats(states, start_date, end_date):
    global csv_data
    print(f"endDate for stats: ${end_date}")
    df = csv_data.loc[((csv_data['submission_date'] == end_date))]
    if len(states) > 0:
        filteredDf = df[(df['state'].isin(states))].groupby(['submission_date']).sum()
    else:
        filteredDf = df.groupby(['submission_date']).sum()

    if len(states) > 0:
        affectedState = csv_data[((csv_data['submission_date'] == end_date) & (df['state'].isin(states)))].sort_values(by='tot_cases').tail(1)[['state']]
    else:
        affectedState = csv_data[((csv_data['submission_date'] == end_date))].sort_values(by='tot_cases').tail(1)[['state']]

    filteredDf = filteredDf[['tot_cases', 'new_case', 'tot_death', 'new_death']]
    filteredDf['state'] = affectedState.values.tolist()[0][0]

    print(filteredDf.columns)
    json = filteredDf[['tot_cases', 'new_case', 'tot_death', 'new_death', 'state']].to_json(orient='table')

    return json


def get_top_states_data(end_date, column):
    global csv_data
    # csv_data['submission_date'] = pd.to_datetime(csv_data['submission_date'], format="%Y-%m-%d")
    # csv_data = csv_data.sort_values(by="submission_date")
    top_n = 7
    df = csv_data[(csv_data['submission_date'] == end_date)]
    df = df.sort_values(by=column)
    othersSum = df.sum()[column] - df.tail(top_n).sum()[column]
    df = df[['submission_date', 'state', column]]
    df = df.tail(top_n)
    df = df.append({'submission_date': end_date, 'state': 'Others', column: othersSum}, ignore_index=True)
    return df.to_json(orient='table')


# def get_pcp_data():  # pass submission_date here and filter data using that
#     global pcp_df
#     # TODO: make start and end dates dynamic
#     end_date = '2021-04-01'
#     start_date = '2021-01-01'
#     columns = list(pcp_df.columns)
#     data = pcp_df.loc[((csv_data['submission_date'] <= end_date) & (csv_data['submission_date'] >= start_date))].to_dict('records')
#     # pcp_df['state'] = pcp_df.state.astype('category').cat.codes
#     # pcp_df['submission_date'] = pcp_df.state.astype('category').cat.codes
#     # kmeans = KMeans(n_clusters=5).fit(pcp_df)
#     # labels = kmeans.labels_.astype(int).tolist()
#     returnVal = {'columns': columns, 'data': data, 'labels': []}
#     return returnVal

def get_pcp_data(end_date): #pass submission_date here and filter data using that
    global pcp_df
    top_n = 42
    df = pcp_df.loc[((csv_data['submission_date'] == end_date))].copy()
    df = df.sort_values(by='tot_cases')
    df = df.tail(top_n)

    columns = list(df.columns)
    data = df.to_dict('records')
    df['state'] = df.state.astype('category').cat.codes
    kmeans = KMeans(n_clusters=5).fit(df)
    labels = kmeans.labels_.astype(int).tolist()
    returnVal = {'columns': columns, 'data': data, 'labels': labels}
    return returnVal

# get_all_columns_data()

# get_top_states_data('2021-03-01', 'tot_cases')
# print(get_states_cases(['CA'], '2021-01-01', '2021-01-02'))
