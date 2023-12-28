from flask import Flask, jsonify, request
from flask_cors import CORS
import json
import pandas as pd
import numpy as np
import re
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.cluster import KMeans
from sklearn.decomposition import TruncatedSVD
from transformers import pipeline

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins":"http://localhost:3000",  "supports_credentials": True}})
def readCSV():
    df = pd.read_csv('text_segments.csv')
    df['text'] = df['text'].fillna('')
    grouped_data = df.groupby('doc_name')['text'].apply(lambda x: ' '.join(x)).reset_index()
    return grouped_data

def clean_text(text):
    # Use regular expression to remove non-alphanumeric characters and spaces
    cleaned_text = re.sub(r'[^A-Za-z0-9\s]', '', text)
    return cleaned_text


def get_documents_from_csv(data):
    document_text_map = {}
    for collection in data:
        document_text_map[collection["doc_name"]] = collection["text"]

    documents = list(document_text_map.values())
    documents = [str(doc) for doc in documents]
    documents = [clean_text(doc) for doc in documents]
    document_names = list(document_text_map.keys())
    return dict(documents= documents, document_names= document_names)

# @app.route('/')
# def hello_world():
#     data = readCSV()
#     data = data.to_dict(orient='records')
#     document_text_map = {}
#     for collection in data:
#        document_text_map[collection["doc_name"]] = collection["text"]

#     documents = list(document_text_map.values())
#     documents = [str(doc) for doc in documents]
#     documents = [clean_text(doc) for doc in documents]


@app.route('/sentiments', methods=['GET'])
def get_sentiments():
    data = readCSV()
    data = data.to_dict(orient='records')
    documents, document_names = get_documents_from_csv(data)['documents'], get_documents_from_csv(data)['document_names']

    chunks_per_document = request.args.get('chunks_per_document', default=10, type=int)

    sentiment_mapping = {
    "1 star": 1,
    "2 stars": 2,
    "3 stars": 3,
    "4 stars": 4,
    "5 stars": 5,
    }

    # Load the BERT-based summarization pipeline
    classifier = pipeline("text-classification", model="nlptown/bert-base-multilingual-uncased-sentiment")

    passage_sentiment_map = {}
    for index, doc in enumerate(documents):
        max_chunk_length = 512  # Adjust as needed
        chunks = [doc[i:i + max_chunk_length] for i in range(0, len(doc), max_chunk_length)][:chunks_per_document]

        # Generate sentiments for each chunk
        chunk_sentiments = {}
        for chunk_index, chunk in enumerate(chunks):
            predictions = classifier(chunk)
            sentiment_value = sentiment_mapping[predictions[0]['label']]  # Assuming predictions is a list with a single element
            chunk_sentiments[chunk] = sentiment_value

        # Calculate average sentiment for the entire document
        average_document_sentiment = sum(chunk_sentiments.values()) / len(chunk_sentiments) if chunk_sentiments else 0

        # Store in the dictionary
        passage_sentiment_map[document_names[index]] = {
            'avg_sentiment': average_document_sentiment,
            'chunk_sentiments': chunk_sentiments
        }


    return json.dumps(passage_sentiment_map).encode('utf-8').decode('unicode_escape')

@app.route('/keywords')
def get_keywords():
    data = readCSV()
    data = data.to_dict(orient='records')
    documents, document_names = get_documents_from_csv(data)['documents'], get_documents_from_csv(data)['document_names']

    tfidf_vectorizer = TfidfVectorizer(stop_words='english')
    tfidf_matrix = tfidf_vectorizer.fit_transform(documents)

    # Apply Truncated SVD for dimensionality reduction
    num_components = 2  # Adjust the number of components as needed
    svd = TruncatedSVD(n_components=num_components)
    reduced_tfidf_matrix = svd.fit_transform(tfidf_matrix)

    # Apply KMeans clustering
    num_clusters = 2 # Adjust the number of clusters as needed
    kmeans = KMeans(n_clusters=num_clusters, random_state=42)
    clusters = kmeans.fit_predict(reduced_tfidf_matrix)

    # Add cluster labels to the original documents
    result_df = pd.DataFrame({'Document': documents, 'Cluster': clusters})

    # Analyze high-weighted keywords in each cluster
    terms = tfidf_vectorizer.get_feature_names_out()
    original_space_centroids = svd.inverse_transform(kmeans.cluster_centers_)
    order_centroids = original_space_centroids.argsort()[:, ::-1]

    result_df['KeyTopics'] = result_df.apply(lambda row: [terms[ind] for ind in order_centroids[row['Cluster'], :5]], axis=1)

    result_dict = {}
    for index, row in result_df.iterrows():
        doc_name = document_names[index]
        keywords = row['KeyTopics']
        result_dict[doc_name] = keywords

    return json.dumps(result_dict).encode('utf-8').decode('unicode_escape')


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')