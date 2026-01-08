# Advanced Web Scraping Tool

## Project Overview
A full-stack web scraping application that allows users to dynamically scrape any website. The tool extracts headings, paragraphs, links, images, tables, and metadata from any public website.

## Features

### Backend (Python/Flask)
- **Dynamic Scraping**: Scrapes any website URL provided by the user
- **Comprehensive Data Extraction**: 
  - Page title and metadata
  - All headings (h1-h6)
  - Paragraph text
  - Internal and external links
  - Images with alt text
  - Tables with headers and rows
- **Error Handling**: Handles invalid URLs, connection issues, and parsing errors
- **Rate Limiting**: Respectful scraping with delays between requests
- **JSON API**: RESTful endpoints for frontend communication

### Frontend (HTML/CSS/JavaScript)
- **Professional UI**: Modern, responsive design with animations
- **Real-time Results**: Dynamic display of scraped data
- **Interactive Elements**:
  - URL input with validation
  - Quick example buttons
  - Loading animations
  - Error/success notifications
- **Data Visualization**:
  - Statistics dashboard
  - Categorized data display
  - Expandable/collapsible sections
  - Raw JSON view
- **Responsive Design**: Works on desktop, tablet, and mobile

## Technology Stack

### Backend
- **Python 3.x**: Main programming language
- **Flask**: Lightweight web framework
- **BeautifulSoup4**: HTML parsing library
- **Requests**: HTTP client library
- **Flask-CORS**: Cross-origin resource sharing

### Frontend
- **HTML5**: Semantic markup
- **CSS3**: Modern styling with CSS Grid and Flexbox
- **JavaScript (ES6+)**: Frontend logic
- **Font Awesome**: Icon library
- **Google Fonts**: Typography

## Project Structure
