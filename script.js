// Navigation and UI functionality
document.addEventListener('DOMContentLoaded', function() {
    initializeNavigation();
    loadExternalData();
    initializeTabs();
    initializeCodeCopying();
    initializeSmoothScrolling();
});

// Navigation functionality
function initializeNavigation() {
    const navLinks = document.querySelectorAll('.nav-link, .sidebar-link');
    const sections = document.querySelectorAll('.doc-section');
    
    // Update active navigation on scroll
    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (scrollY >= (sectionTop - 200)) {
                current = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });
}

// Load external data from WeatherWizard and GitHub
async function loadExternalData() {
    await Promise.all([
        loadWeatherWizardStatus(),
        loadGitHubData(),
        loadWeatherDemo()
    ]);
}

// Load OpenWeather API status
async function loadWeatherWizardStatus() {
    const statusGrid = document.getElementById('status-grid');
    if (!statusGrid) return;
    
    try {
        // Check OpenWeather API status
        const startTime = Date.now();
        const response = await fetch('https://api.openweathermap.org/data/2.5/weather?q=London&appid=70ed5ee796a49f1cbf52107c10eee947&units=metric');
        const responseTime = Date.now() - startTime;
        
        const statusItems = statusGrid.querySelectorAll('.status-item');
        
        if (response.ok) {
            const data = await response.json();
            updateStatusItem(statusItems[0], 'online', 'OpenWeather API', 'Online');
            updateStatusItem(statusItems[1], 'online', 'Response Time', `${responseTime}ms`);
            updateStatusItem(statusItems[2], 'online', 'Current Temp (London)', `${Math.round(data.main.temp)}°C`);
        } else {
            throw new Error('API not responding');
        }
    } catch (error) {
        console.log('OpenWeather API check failed:', error);
        const statusItems = statusGrid.querySelectorAll('.status-item');
        
        updateStatusItem(statusItems[0], 'warning', 'OpenWeather API', 'Need API Key');
        updateStatusItem(statusItems[1], 'warning', 'Response Time', 'N/A');
        updateStatusItem(statusItems[2], 'warning', 'Service Uptime', 'Unknown');
    }
}

// Load weather demo widget
async function loadWeatherDemo() {
    const weatherWidget = document.getElementById('weather-widget');
    if (!weatherWidget) return;
    
    try {
        const response = await fetch('https://api.openweathermap.org/data/2.5/weather?q=New York&appid=70ed5ee796a49f1cbf52107c10eee947&units=metric');
        
        if (response.ok) {
            const data = await response.json();
            
            weatherWidget.innerHTML = `
                <div class="weather-content">
                    <div class="weather-main">
                        <h3 class="weather-location">${data.name}, ${data.sys.country}</h3>
                        <div class="weather-description">${data.weather[0].description}</div>
                        <div class="weather-temp">${Math.round(data.main.temp)}°C</div>
                    </div>
                    <div class="weather-details">
                        <div class="weather-detail">
                            <div class="weather-detail-label">Feels like</div>
                            <div class="weather-detail-value">${Math.round(data.main.feels_like)}°C</div>
                        </div>
                        <div class="weather-detail">
                            <div class="weather-detail-label">Humidity</div>
                            <div class="weather-detail-value">${data.main.humidity}%</div>
                        </div>
                        <div class="weather-detail">
                            <div class="weather-detail-label">Wind Speed</div>
                            <div class="weather-detail-value">${data.wind.speed} m/s</div>
                        </div>
                        <div class="weather-detail">
                            <div class="weather-detail-label">Pressure</div>
                            <div class="weather-detail-value">${data.main.pressure} hPa</div>
                        </div>
                    </div>
                </div>
            `;
        } else {
            throw new Error('Weather API error');
        }
    } catch (error) {
        console.log('Weather demo failed to load:', error);
        weatherWidget.innerHTML = `
            <div class="weather-loading">
                <span>Unable to load weather data</span>
            </div>
        `;
    }
}

// Update individual status item
function updateStatusItem(item, status, name, value) {
    if (!item) return;
    
    const indicator = item.querySelector('.status-indicator');
    const nameEl = item.querySelector('.status-name');
    const valueEl = item.querySelector('.status-value');
    
    indicator.className = `status-indicator ${status}`;
    nameEl.textContent = name;
    valueEl.textContent = value;
}

// Load GitHub repository data
async function loadGitHubData() {
    const githubStats = document.getElementById('github-stats');
    const githubActivity = document.getElementById('github-activity');
    
    if (!githubStats || !githubActivity) return;
    
    try {
        // Load repository information
        const repoResponse = await fetch('https://api.github.com/repos/hgfghhccchgtjcdfhhhh/weatherwizard-app');
        
        if (repoResponse.ok) {
            const repoData = await repoResponse.json();
            
            // Update stats
            const statValues = githubStats.querySelectorAll('.stat-value');
            statValues[0].textContent = repoData.stargazers_count || '0';
            statValues[1].textContent = repoData.forks_count || '0';
            statValues[2].textContent = repoData.open_issues_count || '0';
        }
        
        // Load recent commits
        const commitsResponse = await fetch('https://api.github.com/repos/hgfghhccchgtjcdfhhhh/weatherwizard-app/commits?per_page=3');
        
        if (commitsResponse.ok) {
            const commitsData = await commitsResponse.json();
            updateCommitsDisplay(githubActivity, commitsData);
        }
    } catch (error) {
        console.log('GitHub API not available, showing fallback data');
        
        // Show fallback stats
        const statValues = githubStats.querySelectorAll('.stat-value');
        statValues[0].textContent = '—';
        statValues[1].textContent = '—';
        statValues[2].textContent = '—';
        
        // Show fallback activity
        githubActivity.innerHTML = `
            <h4>Recent Activity</h4>
            <div class="commits-loading">GitHub data temporarily unavailable</div>
        `;
    }
}

// Update commits display
function updateCommitsDisplay(container, commits) {
    const commitsHtml = commits.map(commit => {
        const date = new Date(commit.commit.author.date);
        const timeAgo = getTimeAgo(date);
        const message = commit.commit.message.length > 60 
            ? commit.commit.message.substring(0, 60) + '...'
            : commit.commit.message;
        
        return `
            <div class="commit-item">
                <div class="commit-dot"></div>
                <span class="commit-message">${escapeHtml(message)}</span>
                <span class="commit-time">${timeAgo}</span>
            </div>
        `;
    }).join('');
    
    container.innerHTML = `
        <h4>Recent Commits</h4>
        ${commitsHtml}
    `;
}

// Get time ago string
function getTimeAgo(date) {
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    const intervals = {
        year: 31536000,
        month: 2592000,
        week: 604800,
        day: 86400,
        hour: 3600,
        minute: 60
    };
    
    for (const [unit, seconds] of Object.entries(intervals)) {
        const interval = Math.floor(diffInSeconds / seconds);
        if (interval >= 1) {
            return `${interval} ${unit}${interval > 1 ? 's' : ''} ago`;
        }
    }
    
    return 'just now';
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Initialize tab functionality
function initializeTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.textContent.toLowerCase().replace(/[^a-z]/g, '');
            showTab(targetTab);
        });
    });
}

// Show specific tab
function showTab(tabName) {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    // Update button states
    tabBtns.forEach(btn => {
        btn.classList.remove('active');
        if (btn.textContent.toLowerCase().replace(/[^a-z]/g, '') === tabName) {
            btn.classList.add('active');
        }
    });
    
    // Update content visibility
    tabContents.forEach(content => {
        content.classList.remove('active');
        if (content.id === tabName) {
            content.classList.add('active');
        }
    });
}

// Initialize code copying functionality
function initializeCopyButtons() {
    const copyButtons = document.querySelectorAll('.copy-btn');
    copyButtons.forEach(btn => {
        btn.addEventListener('click', () => copyCode(btn));
    });
}

// Alias for backward compatibility
function initializeCodeCopying() {
    initializeCopyButtons();
}

// Copy code to clipboard
function copyCode(button) {
    const codeBlock = button.closest('.code-example').querySelector('code');
    const text = codeBlock.textContent;
    
    navigator.clipboard.writeText(text).then(() => {
        const originalText = button.textContent;
        button.textContent = 'Copied!';
        button.style.background = '#10b981';
        button.style.color = 'white';
        button.style.borderColor = '#10b981';
        
        setTimeout(() => {
            button.textContent = originalText;
            button.style.background = '';
            button.style.color = '';
            button.style.borderColor = '';
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy code:', err);
        button.textContent = 'Copy failed';
        setTimeout(() => {
            button.textContent = 'Copy';
        }, 2000);
    });
}

// Initialize smooth scrolling for anchor links
function initializeSmoothScrolling() {
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    
    anchorLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = targetElement.offsetTop - headerHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Search functionality
function initializeSearch() {
    const searchInput = document.querySelector('.search-input');
    const sections = document.querySelectorAll('.doc-section');
    
    if (!searchInput) return;
    
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        
        if (query.length < 2) {
            // Show all sections
            sections.forEach(section => {
                section.style.display = 'block';
            });
            return;
        }
        
        // Filter sections based on search
        sections.forEach(section => {
            const text = section.textContent.toLowerCase();
            const title = section.querySelector('h1, h2')?.textContent.toLowerCase() || '';
            
            if (text.includes(query) || title.includes(query)) {
                section.style.display = 'block';
                highlightSearchTerms(section, query);
            } else {
                section.style.display = 'none';
            }
        });
    });
}

// Highlight search terms (basic implementation)
function highlightSearchTerms(element, query) {
    // This is a simplified version - in a real app you'd want more sophisticated highlighting
    const textNodes = getTextNodes(element);
    textNodes.forEach(node => {
        if (node.textContent.toLowerCase().includes(query)) {
            const parent = node.parentNode;
            const wrapper = document.createElement('mark');
            wrapper.style.background = '#fef08a';
            wrapper.style.padding = '2px 4px';
            wrapper.style.borderRadius = '3px';
            
            // This is a simplified highlighting - would need more robust implementation
            const regex = new RegExp(`(${escapeRegex(query)})`, 'gi');
            const highlighted = node.textContent.replace(regex, '<mark style="background: #fef08a; padding: 2px 4px; border-radius: 3px;">$1</mark>');
            
            if (highlighted !== node.textContent) {
                const temp = document.createElement('div');
                temp.innerHTML = highlighted;
                while (temp.firstChild) {
                    parent.insertBefore(temp.firstChild, node);
                }
                parent.removeChild(node);
            }
        }
    });
}

// Get all text nodes in an element
function getTextNodes(element) {
    const textNodes = [];
    const walker = document.createTreeWalker(
        element,
        NodeFilter.SHOW_TEXT,
        null,
        false
    );
    
    let node;
    while (node = walker.nextNode()) {
        textNodes.push(node);
    }
    
    return textNodes;
}

// Escape regex special characters
function escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeNavigation();
    loadExternalData();
    initializeTabs();
    initializeCopyButtons();
    initializeSmoothScrolling();
    initializeSearch();
});

// Refresh data periodically
setInterval(() => {
    loadExternalData();
}, 5 * 60 * 1000); // Refresh every 5 minutes