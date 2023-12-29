## About The Project

1. Main steps and Motivation for any data engineering/processing:
* Data Cleaning and Preprocessing: The readCSV function reads a CSV file, handles missing values, and groups text segments by document name. 
The clean_text function removes non-alphanumeric characters, ensuring cleaner text data. These steps are crucial for handling real-world data, cleaning noise, and preparing it for analysis.
* Text Segmentation and Grouping: The data is grouped by document name, consolidating text segments into full documents. 
This step simplifies the analysis and allows the API to provide insights at the document level.

2. Main Functionalities of the API:
* Sentiment Analysis (/sentiments): The API calculates sentiment scores for each document using a BERT-based pipeline. It segments the text into chunks, analyzes the sentiment of each chunk, and provides an average sentiment score for the entire document.
* Keyword Extraction (/keywords): The API performs TF-IDF vectorization, applies Truncated SVD for dimensionality reduction, and uses KMeans clustering to group documents. It then extracts key topics from each cluster, providing insights into high-weighted keywords for each document.
* CORS Configuration: The API handles Cross-Origin Resource Sharing (CORS) by allowing requests from http://localhost:3000, facilitating frontend integration.

3. Key Challenges:
* Breaking down large text documents into manageable chunks for sentiment analysis while preserving context can be challenging. The use of BERT-based summarization helps, but determining optimal chunk sizes is an ongoing challenge.
* Selecting the right number of clusters for KMeans clustering (/keywords) is a common challenge. The code uses a fixed number, but a more dynamic approach or clustering evaluation metrics could enhance accuracy.

4. Improvements if Given More Time:
* Explore additional sentiment analysis models or fine-tune existing ones for improved accuracy. Experiment with models trained on domain-specific data if available.
* Implement a mechanism to dynamically determine the optimal number of clusters for keyword extraction (/keywords), perhaps using clustering validation metrics.
* Implement unit tests to ensure the robustness and reliability of the API, covering various scenarios and edge cases.
* Implement security measures such as input validation and sanitization to prevent potential vulnerabilities.
* Optimize the API for scalability, especially if dealing with larger datasets. Consider asynchronous processing for computationally intensive tasks.
* Integrate logging and monitoring functionalities to track API usage, errors, and performance metrics for ongoing maintenance and improvements.

