"""
Advanced Web Scraping Tool - Backend Server
Author: Web Scraping Project
Date: 2024
Description: Flask server that receives URLs, scrapes websites, and returns structured data
"""

from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse
import json
import re
import os
from datetime import datetime

app = Flask(__name__)
CORS(app)  # Enable Cross-Origin Resource Sharing for frontend-backend communication

# Create data directory if it doesn't exist
os.makedirs('scraped_data', exist_ok=True)

def is_valid_url(url):
    """Validate URL format."""
    try:
        result = urlparse(url)
        return all([result.scheme, result.netloc])
    except:
        return False

def clean_text(text):
    """Clean and normalize text content."""
    if not text:
        return ""
    # Remove extra whitespace and newlines
    text = re.sub(r'\s+', ' ', text)
    text = text.strip()
    return text

def scrape_website(url):
    """
    Main scraping function that extracts data from any given URL.
    
    Args:
        url (str): The website URL to scrape
    
    Returns:
        dict: Structured data containing all scraped elements
    """
    print(f"Starting scrape of: {url}")
    
    try:
        # Send HTTP request with headers to mimic a real browser
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate',
            'Connection': 'keep-alive',
        }
        
        response = requests.get(url, headers=headers, timeout=15)
        response.raise_for_status()  # Raise exception for bad status codes
        
        # Parse HTML content
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Extract page metadata
        page_title = soup.title.string if soup.title else "No Title"
        
        # Extract headings
        headings = {
            'h1': [clean_text(h.get_text()) for h in soup.find_all('h1')],
            'h2': [clean_text(h.get_text()) for h in soup.find_all('h2')],
            'h3': [clean_text(h.get_text()) for h in soup.find_all('h3')],
            'h4': [clean_text(h.get_text()) for h in soup.find_all('h4')],
            'h5': [clean_text(h.get_text()) for h in soup.find_all('h5')],
            'h6': [clean_text(h.get_text()) for h in soup.find_all('h6')]
        }
        
        # Extract paragraphs (limit to first 50 for performance)
        paragraphs = [clean_text(p.get_text()) for p in soup.find_all('p')[:50]]
        
        # Extract links with full URLs
        links = []
        for link in soup.find_all('a', href=True)[:100]:  # Limit to 100 links
            href = link['href']
            text = clean_text(link.get_text())
            
            # Convert relative URLs to absolute
            full_url = urljoin(url, href)
            
            # Validate URL
            if is_valid_url(full_url):
                links.append({
                    'text': text or '[No Text]',
                    'url': full_url,
                    'is_external': urlparse(full_url).netloc != urlparse(url).netloc
                })
        
        # Extract images
        images = []
        for img in soup.find_all('img', src=True)[:50]:  # Limit to 50 images
            src = img['src']
            alt = img.get('alt', 'No alt text')
            
            # Convert relative URLs to absolute
            full_src = urljoin(url, src)
            
            if is_valid_url(full_src):
                images.append({
                    'src': full_src,
                    'alt': clean_text(alt),
                    'title': img.get('title', '')
                })
        
        # Extract tables
        tables = []
        for table in soup.find_all('table')[:10]:  # Limit to 10 tables
            table_data = []
            
            # Extract table headers
            headers = []
            for th in table.find_all('th'):
                headers.append(clean_text(th.get_text()))
            
            # Extract table rows
            for row in table.find_all('tr'):
                row_data = []
                for cell in row.find_all(['td', 'th']):
                    row_data.append(clean_text(cell.get_text()))
                if row_data:  # Only add non-empty rows
                    table_data.append(row_data)
            
            if table_data:
                tables.append({
                    'headers': headers,
                    'rows': table_data
                })
        
        # Extract meta description
        meta_desc = ""
        meta_tag = soup.find('meta', attrs={'name': 'description'})
        if meta_tag:
            meta_desc = meta_tag.get('content', '')
        
        # Extract meta keywords
        meta_keywords = ""
        keywords_tag = soup.find('meta', attrs={'name': 'keywords'})
        if keywords_tag:
            meta_keywords = keywords_tag.get('content', '')
        
        # Compile all data
        scraped_data = {
            'metadata': {
                'url': url,
                'title': clean_text(page_title),
                'description': clean_text(meta_desc),
                'keywords': clean_text(meta_keywords),
                'scrape_timestamp': datetime.now().isoformat(),
                'status_code': response.status_code,
                'content_type': response.headers.get('content-type', ''),
                'content_length': len(response.content)
            },
            'headings': headings,
            'paragraphs': paragraphs,
            'links': links,
            'images': images,
            'tables': tables,
            'statistics': {
                'total_headings': sum(len(h) for h in headings.values()),
                'total_paragraphs': len(paragraphs),
                'total_links': len(links),
                'total_images': len(images),
                'total_tables': len(tables),
                'external_links': len([l for l in links if l['is_external']])
            }
        }
        
        print(f"Successfully scraped: {url}")
        print(f"Found: {scraped_data['statistics']['total_headings']} headings, "
              f"{scraped_data['statistics']['total_paragraphs']} paragraphs, "
              f"{scraped_data['statistics']['total_links']} links")
        
        return scraped_data
        
    except requests.exceptions.RequestException as e:
        print(f"Request error for {url}: {str(e)}")
        raise Exception(f"Failed to fetch URL: {str(e)}")
    except Exception as e:
        print(f"Scraping error for {url}: {str(e)}")
        raise Exception(f"Scraping failed: {str(e)}")

@app.route('/api/scrape', methods=['POST'])
def api_scrape():
    """API endpoint to scrape a website."""
    try:
        # Get URL from request
        data = request.get_json()
        url = data.get('url')
        
        if not url:
            return jsonify({'error': 'No URL provided'}), 400
        
        if not is_valid_url(url):
            return jsonify({'error': 'Invalid URL format'}), 400
        
        # Scrape the website
        scraped_data = scrape_website(url)
        
        # Save data to file
        filename = f"scraped_data/scrape_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(scraped_data, f, indent=2, ensure_ascii=False)
        
        # Also update the main data.json for frontend
        with open('data.json', 'w', encoding='utf-8') as f:
            json.dump(scraped_data, f, indent=2, ensure_ascii=False)
        
        return jsonify({
            'success': True,
            'message': 'Website scraped successfully',
            'data': scraped_data,
            'filename': filename
        })
        
    except Exception as e:
        print(f"API error: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/latest', methods=['GET'])
def get_latest_data():
    """Get the latest scraped data."""
    try:
        if os.path.exists('data.json'):
            with open('data.json', 'r', encoding='utf-8') as f:
                data = json.load(f)
            return jsonify(data)
        else:
            return jsonify({'error': 'No data available'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/test', methods=['GET'])
def test_api():
    """Test endpoint to verify API is working."""
    return jsonify({
        'status': 'online',
        'service': 'Web Scraping API',
        'version': '1.0.0',
        'timestamp': datetime.now().isoformat()
    })

@app.route('/')
def serve_frontend():
    """Serve the frontend HTML file."""
    return send_from_directory('.', 'index.html')

@app.route('/<path:path>')
def serve_static_files(path):
    """Serve static files (CSS, JS)."""
    return send_from_directory('.', path)

if __name__ == '__main__':
    print("=" * 60)
    print("Advanced Web Scraping Tool - Backend Server")
    print("=" * 60)
    print("Server starting on http://localhost:5000")
    print("API Endpoints:")
    print("  GET  /api/test          - Test API connection")
    print("  POST /api/scrape        - Scrape a website")
    print("  GET  /api/latest        - Get latest scraped data")
    print("=" * 60)
    
    # Create initial data.json if it doesn't exist
    if not os.path.exists('data.json'):
        with open('data.json', 'w', encoding='utf-8') as f:
            json.dump({'metadata': {'message': 'No data scraped yet'}}, f)
    
    # Run Flask server
    app.run(host='0.0.0.0', port=5000, debug=True)