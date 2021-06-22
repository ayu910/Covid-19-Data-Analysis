import json, math

from flask import Flask, render_template, jsonify, request
from flask_cors import CORS
import numpy as np
import pandas as pd

from sklearn.preprocessing import StandardScaler
from sklearn.manifold import MDS
from sklearn import metrics
from sklearn.cluster import KMeans

from preprocessing import get_statewise_total_cases_data, get_country_cases, get_states_cases, get_top_states_data, \
    get_pcp_data, get_all_stats

app = Flask(__name__)
CORS(app)

csv_data = pd.read_csv("static/data/covid_us.csv")


@app.route('/')
def hello():
    return render_template('index.html')


@app.route('/getMapData/<enddate>/<selectedcolumn>', methods=['GET'])
def get_map_data(enddate, selectedcolumn):
    result = get_statewise_total_cases_data(enddate, selectedcolumn)
    return jsonify(json.loads(result))


@app.route('/getTotalCases/<selectedcolumn>', methods=['POST'])
def get_total_cases(selectedcolumn):
    json = request.json
    print(json)
    print(json['states'])
    if ('all' in json['states'] or len(json['states']) == 0):
        return get_country_cases(json['startDate'], json['endDate'], selectedcolumn)
    else:
        return get_states_cases(json['states'], json['startDate'], json['endDate'], selectedcolumn)


@app.route('/getStats', methods=['POST'])
def get_stats():
    json = request.json
    if ('all' in json['states'] or len(json['states']) == 0):
        return get_all_stats([], json['startDate'], json['endDate'])
    else:
        return get_all_stats(json['states'], json['startDate'], json['endDate'])


@app.route('/getDataAndColumns/<enddate>', methods=['GET'])
def get_column_data(enddate):
    result = get_pcp_data(enddate)
    return jsonify(result)


@app.route('/getPieData/<enddate>/<selectedcolumn>', methods=['GET'])
def get_pie_data(enddate, selectedcolumn):
    result = get_top_states_data(enddate, selectedcolumn)
    return jsonify(json.loads(result))


def get_mds_states_cases(states, start_date, end_date, column):
    global csv_data
    df = csv_data.loc[((csv_data['submission_date'] <= end_date) & (csv_data['submission_date'] >= start_date))]
    # number = math.ceil(df.shape[0])
    # kmeans = KMeans(n_clusters=3)
    # kmeans = kmeans.fit(df)
    # dlabels = kmeans.labels_

    if len(states) != 0:
        df = df[(df['state'].isin(states))]
    # else:
    #     df = df.sort_values(by='tot_cases').sample(7)
    else:
        df = df[(df['state'].isin(['NY', 'TX', 'FL', 'PA', 'MT','OR', 'WI', 'UT', 'MN' ]))]

    data = df.groupby(['state']).sum()
    data = data.T
    # data = StandardScaler().fit_transform(data.T)
    print(data)
    listData = list(data)
    data = StandardScaler().fit_transform(data.T)
    matrix = metrics.pairwise_distances(data, metric="correlation")
    mds_func = MDS(n_components=2, dissimilarity="precomputed")
    mdsData = mds_func.fit_transform(matrix)

    # number = math.ceil(mdsData.shape[0])

    # mdsData = np.append(mdsData, dlabels.values.reshape(number, 1), axis=1)

    output = pd.DataFrame(mdsData, columns=['x', 'y'])

    if len(states) == 1:
        kmeans = KMeans(n_clusters=1)
        kmeans = kmeans.fit(output)
        output['cluster'] = kmeans.labels_
    elif len(states) == 2:
        kmeans = KMeans(n_clusters=2)
        kmeans = kmeans.fit(output)
        output['cluster'] = kmeans.labels_
    else:
        kmeans = KMeans(n_clusters=3)
        kmeans = kmeans.fit(output)
        output['cluster'] = kmeans.labels_

    output.insert(loc=0, column='Attr', value=listData)
    return jsonify({'data': output.to_dict('records')});


@app.route('/getMdsTotalCases/<selectedcolumn>', methods=['POST'])
def get_mds_total_cases(selectedcolumn):
    json = request.json
    print(json)
    print(json['states'])
    return get_mds_states_cases(json['states'], json['startDate'], json['endDate'], selectedcolumn)




if __name__ == '__main__':
    app.run(debug=True)
