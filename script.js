/**
 * Advanced Web Scraping Tool - Frontend JavaScript
 * Handles user interaction, API communication, and dynamic data display
 */

document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const urlInput = document.getElementById('urlInput');
    const scrapeBtn = document.getElementById('scrapeBtn');
    const loadingContainer = document.getElementById('loadingContainer');
    const errorContainer = document.getElementById('errorContainer');
    const resultsSection = document.getElementById('resultsSection');
    const resultsStats = document.getElementById('resultsStats');
    
    // API Configuration
    const API_BASE_URL = 'http://localhost:5000/api';
    
    // Check server status on load
    checkServerStatus();
    
    // Event Listeners
    scrapeBtn.addEventListener('click', handleScrape);
    urlInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') handleScrape();
    });
    
    // Example buttons
    document.querySelectorAll('.example-btn').forEach(button => {
        button.addEventListener('click', function() {
            const url = this.getAttribute('data-url');
            urlInput.value = url;
            handleScrape();
        });
    });
    
    // Toggle raw data
    document.getElementById('toggleRawData').addEventListener('click', function() {
        const rawDataContent = document.getElementById('rawDataContent');
        rawDataContent.classList.toggle('active');
        this.innerHTML = rawDataContent.classList.contains('active') 
            ? '<i class="fas fa-eye-slash"></i> Hide Raw Data' 
            : '<i class="fas fa-eye"></i> Show Raw Data';
    });
    
    /**
     * Check if the backend server is running
     */
    async function checkServerStatus() {
        const statusElement = document.getElementById('serverStatus');
        
        try {
            const response = await fetch(`${API_BASE_URL}/test`);
            if (response.ok) {
                statusElement.textContent = 'Online';
                statusElement.className = 'online';
            } else {
                statusElement.textContent = 'Offline';
                statusElement.className = 'offline';
            }
        } catch (error) {
            statusElement.textContent = 'Offline';
            statusElement.className = 'offline';
            console.warn('Backend server is not running. Please start scraper.py');
        }
    }
    
    /**
     * Handle the scrape button click
     */
    async function handleScrape() {
        const url = urlInput.value.trim();
        
        // Validate URL
        if (!url) {
            showError('Please enter a website URL');
            return;
        }
        
        if (!isValidUrl(url)) {
            showError('Please enter a valid URL (include http:// or https://)');
            return;
        }
        
        // Clear previous results and errors
        clearError();
        clearResults();
        
        // Show loading state
        showLoading(true);
        
        try {
            // Call the API to scrape the website
            const response = await fetch(`${API_BASE_URL}/scrape`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ url: url })
            });
            
            const data = await response.json();
            
            if (response.ok && data.success) {
                // Display the scraped data
                displayResults(data.data);
                showSuccess('Website scraped successfully!');
            } else {
                showError(data.error || 'Failed to scrape website');
            }
        } catch (error) {
            console.error('Scraping error:', error);
            showError('Failed to connect to scraping server. Make sure scraper.py is running.');
        } finally {
            showLoading(false);
        }
    }
    
    /**
     * Validate URL format
     */
    function isValidUrl(string) {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    }
    
    /**
     * Show/hide loading animation
     */
    function showLoading(show) {
        if (show) {
            loadingContainer.classList.add('active');
            scrapeBtn.disabled = true;
            scrapeBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Scraping...';
        } else {
            loadingContainer.classList.remove('active');
            scrapeBtn.disabled = false;
            scrapeBtn.innerHTML = '<i class="fas fa-search"></i> Scrape Website';
        }
    }
    
    /**
     * Display error message
     */
    function showError(message) {
        errorContainer.textContent = message;
        errorContainer.classList.add('active');
        
        // Auto-hide error after 5 seconds
        setTimeout(clearError, 5000);
    }
    
    /**
     * Show success message (toast notification)
     */
    function showSuccess(message) {
        // Create toast notification
        const toast = document.createElement('div');
        toast.className = 'toast-notification';
        toast.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <span>${message}</span>
        `;
        
        // Add styles
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(45deg, #38a169, #2f855a);
            color: white;
            padding: 15px 25px;
            border-radius: 8px;
            display: flex;
            align-items: center;
            gap: 10px;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
            z-index: 1000;
            animation: slideInRight 0.3s ease;
        `;
        
        document.body.appendChild(toast);
        
        // Remove toast after 3 seconds
        setTimeout(() => {
            toast.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
    
    /**
     * Clear error message
     */
    function clearError() {
        errorContainer.classList.remove('active');
        errorContainer.textContent = '';
    }
    
    /**
     * Clear previous results
     */
    function clearResults() {
        resultsSection.classList.remove('active');
    }
    
    /**
     * Display scraped results
     */
    function displayResults(data) {
        // Show results section
        resultsSection.classList.add('active');
        
        // Display statistics
        displayStatistics(data.statistics);
        
        // Display metadata
        displayMetadata(data.metadata);
        
        // Display headings
        displayHeadings(data.headings);
        
        // Display paragraphs
        displayParagraphs(data.paragraphs);
        
        // Display links
        displayLinks(data.links);
        
        // Display images
        displayImages(data.images);
        
        // Display tables
        displayTables(data.tables);
        
        // Display raw JSON data
        displayRawData(data);
        
        // Scroll to results
        resultsSection.scrollIntoView({ behavior: 'smooth' });
    }
    
    /**
     * Display statistics
     */
    function displayStatistics(stats) {
        resultsStats.innerHTML = `
            <div class="stat-item">
                <div class="stat-value">${stats.total_headings}</div>
                <div class="stat-label">Headings</div>
            </div>
            <div class="stat-item">
                <div class="stat-value">${stats.total_paragraphs}</div>
                <div class="stat-label">Paragraphs</div>
            </div>
            <div class="stat-item">
                <div class="stat-value">${stats.total_links}</div>
                <div class="stat-label">Links</div>
            </div>
            <div class="stat-item">
                <div class="stat-value">${stats.total_images}</div>
                <div class="stat-label">Images</div>
            </div>
            <div class="stat-item">
                <div class="stat-value">${stats.total_tables}</div>
                <div class="stat-label">Tables</div>
            </div>
            <div class="stat-item">
                <div class="stat-value">${stats.external_links}</div>
                <div class="stat-label">External Links</div>
            </div>
        `;
    }
    
    /**
     * Display metadata
     */
    function displayMetadata(metadata) {
        const metadataContent = document.getElementById('metadataContent');
        
        metadataContent.innerHTML = `
            <div class="metadata-item">
                <div class="metadata-label">Page Title</div>
                <div class="metadata-value">${escapeHtml(metadata.title) || 'No title found'}</div>
            </div>
            <div class="metadata-item">
                <div class="metadata-label">URL</div>
                <div class="metadata-value">
                    <a href="${metadata.url}" target="_blank" style="color: #4361ee;">
                        ${metadata.url}
                    </a>
                </div>
            </div>
            <div class="metadata-item">
                <div class="metadata-label">Description</div>
                <div class="metadata-value">${escapeHtml(metadata.description) || 'No description found'}</div>
            </div>
            <div class="metadata-item">
                <div class="metadata-label">Keywords</div>
                <div class="metadata-value">${escapeHtml(metadata.keywords) || 'No keywords found'}</div>
            </div>
            <div class="metadata-item">
                <div class="metadata-label">Scraped At</div>
                <div class="metadata-value">${formatDate(metadata.scrape_timestamp)}</div>
            </div>
            <div class="metadata-item">
                <div class="metadata-label">Status Code</div>
                <div class="metadata-value">
                    <span class="${metadata.status_code === 200 ? 'success-badge' : 'error-badge'}">
                        ${metadata.status_code}
                    </span>
                </div>
            </div>
            <div class="metadata-item">
                <div class="metadata-label">Content Type</div>
                <div class="metadata-value">${metadata.content_type || 'Unknown'}</div>
            </div>
            <div class="metadata-item">
                <div class="metadata-label">Content Size</div>
                <div class="metadata-value">${formatBytes(metadata.content_length)}</div>
            </div>
        `;
        
        // Add CSS for badges
        const style = document.createElement('style');
        style.textContent = `
            .success-badge {
                background: #d4edda;
                color: #155724;
                padding: 4px 12px;
                border-radius: 20px;
                font-weight: 600;
            }
            .error-badge {
                background: #f8d7da;
                color: #721c24;
                padding: 4px 12px;
                border-radius: 20px;
                font-weight: 600;
            }
        `;
        document.head.appendChild(style);
    }
    
    /**
     * Display headings
     */
    function displayHeadings(headings) {
        const headingsContent = document.getElementById('headingsContent');
        let html = '';
        
        for (const [level, headingList] of Object.entries(headings)) {
            if (headingList.length > 0) {
                html += `
                    <div class="heading-level">
                        <h4>
                            <i class="fas fa-heading"></i>
                            ${level.toUpperCase()} Headings (${headingList.length})
                        </h4>
                        <div class="heading-list">
                `;
                
                headingList.forEach(heading => {
                    html += `
                        <div class="heading-item">
                            ${escapeHtml(heading)}
                        </div>
                    `;
                });
                
                html += `
                        </div>
                    </div>
                `;
            }
        }
        
        headingsContent.innerHTML = html || '<p>No headings found on this page.</p>';
    }
    
    /**
     * Display paragraphs
     */
    function displayParagraphs(paragraphs) {
        const contentContent = document.getElementById('contentContent');
        
        if (paragraphs.length === 0) {
            contentContent.innerHTML = '<p>No paragraph text found on this page.</p>';
            return;
        }
        
        let html = '';
        paragraphs.forEach((para, index) => {
            if (para.trim()) {
                html += `
                    <div class="paragraph-item">
                        <span class="paragraph-index">${index + 1}</span>
                        <strong>Paragraph ${index + 1}:</strong>
                        <p style="margin-top: 10px; line-height: 1.6;">${escapeHtml(para)}</p>
                    </div>
                `;
            }
        });
        
        contentContent.innerHTML = html || '<p>No readable paragraph text found.</p>';
    }
    
    /**
     * Display links
     */
    function displayLinks(links) {
        const linksContent = document.getElementById('linksContent');
        
        if (links.length === 0) {
            linksContent.innerHTML = '<p>No links found on this page.</p>';
            return;
        }
        
        let html = '';
        links.forEach((link, index) => {
            html += `
                <div class="link-item">
                    <div class="link-text">
                        <i class="fas fa-link"></i>
                        ${escapeHtml(link.text)}
                    </div>
                    <div class="link-url">${escapeHtml(link.url)}</div>
                    <div>
                        <span class="link-badge ${link.is_external ? 'badge-external' : 'badge-internal'}">
                            ${link.is_external ? 'External Link' : 'Internal Link'}
                        </span>
                    </div>
                </div>
            `;
        });
        
        linksContent.innerHTML = html;
    }
    
    /**
     * Display images
     */
    function displayImages(images) {
        const imagesContent = document.getElementById('imagesContent');
        
        if (images.length === 0) {
            imagesContent.innerHTML = '<p>No images found on this page.</p>';
            return;
        }
        
        let html = '';
        images.forEach((image, index) => {
            html += `
                <div class="image-item">
                    <img src="${image.src}" alt="${escapeHtml(image.alt)}" class="image-preview" 
                         onerror="this.src='https://via.placeholder.com/200x150?text=Image+Not+Available'">
                    <div class="image-info">
                        <div class="image-alt">${escapeHtml(image.alt) || 'No alt text'}</div>
                        <div class="image-url">${truncateText(image.src, 50)}</div>
                    </div>
                </div>
            `;
        });
        
        imagesContent.innerHTML = html;
    }
    
    /**
     * Display tables
     */
    function displayTables(tables) {
        const tablesContent = document.getElementById('tablesContent');
        
        if (tables.length === 0) {
            tablesContent.innerHTML = '<p>No tables found on this page.</p>';
            return;
        }
        
        let html = '';
        tables.forEach((table, tableIndex) => {
            html += `
                <div class="table-item">
                    <h4>
                        <i class="fas fa-table"></i>
                        Table ${tableIndex + 1} (${table.rows.length} rows)
                    </h4>
                    <table class="scraped-table">
                        <thead>
                            <tr>
            `;
            
            // Display headers if available
            if (table.headers.length > 0) {
                table.headers.forEach(header => {
                    html += `<th>${escapeHtml(header)}</th>`;
                });
            } else {
                // Create generic headers based on first row
                if (table.rows.length > 0) {
                    for (let i = 0; i < table.rows[0].length; i++) {
                        html += `<th>Column ${i + 1}</th>`;
                    }
                }
            }
            
            html += `
                            </tr>
                        </thead>
                        <tbody>
            `;
            
            // Display rows
            table.rows.forEach((row, rowIndex) => {
                html += '<tr>';
                row.forEach(cell => {
                    html += `<td>${escapeHtml(cell)}</td>`;
                });
                html += '</tr>';
            });
            
            html += `
                        </tbody>
                    </table>
                </div>
            `;
        });
        
        tablesContent.innerHTML = html;
    }
    
    /**
     * Display raw JSON data
     */
    function displayRawData(data) {
        const rawDataContent = document.getElementById('rawDataContent');
        const codeElement = rawDataContent.querySelector('code');
        codeElement.textContent = JSON.stringify(data, null, 2);
        
        // Apply syntax highlighting
        hljs.highlightElement(codeElement);
    }
    
    /**
     * Helper: Escape HTML to prevent XSS
     */
    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    /**
     * Helper: Format date
     */
    function formatDate(isoString) {
        const date = new Date(isoString);
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    }
    
    /**
     * Helper: Format bytes to human readable format
     */
    function formatBytes(bytes, decimals = 2) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }
    
    /**
     * Helper: Truncate text
     */
    function truncateText(text, maxLength) {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }
    
    // Add CSS animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes slideOutRight {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
        
        @keyframes fadeInDown {
            from { opacity: 0; transform: translateY(-20px); }
            to { opacity: 1; transform: translateY(0); }
        }
    `;
    document.head.appendChild(style);
});