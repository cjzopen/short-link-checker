from flask import Flask, request, jsonify
import requests
from bs4 import BeautifulSoup
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/decode', methods=['POST'])
def decode():
    data = request.json
    short_url = data.get('shortUrl')

    try:
        # 1. 解碼短網址
        response = requests.get(short_url, allow_redirects=False)
        destination_url = response.headers.get('Location', short_url)

        # 2. 獲取目標頁面資訊
        page_response = requests.get(destination_url)
        soup = BeautifulSoup(page_response.text, 'html.parser')
        title = soup.title.string if soup.title else '無法獲取'
        description = soup.find('meta', attrs={'name': 'description'})
        description = description['content'] if description else '無法獲取'

        return jsonify({'destinationUrl': destination_url, 'title': title, 'description': description})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(port=3000)
