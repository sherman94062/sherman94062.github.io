const GITHUB_USERNAME = 'sherman94062'; 

async function fetchProjects() {
    const grid = document.getElementById('project-grid');
    
    try {
        const response = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=100`);
        
        if (!response.ok) {
            if (response.status === 403) {
                grid.innerHTML = "<p>GitHub Rate Limit reached. Please wait a few minutes and refresh.</p>";
            } else {
                grid.innerHTML = `<p>Error: ${response.statusText}</p>`;
            }
            return;
        }

        const repos = await response.json();
        grid.innerHTML = ''; // Clear the "Looking for repos" message

        if (repos.length === 0) {
            grid.innerHTML = "<p>No public repositories found for this user.</p>";
            return;
        }

        repos.forEach(repo => {
            // 1. Skip the profile README
            if (repo.name.toLowerCase() === GITHUB_USERNAME.toLowerCase()) return;

            // 2. Safely handle topics (prevents the crash)
            const topics = repo.topics || []; 
            
            // 3. Create the card
            const card = document.createElement('div');
            card.className = 'project-card';
            
            // Clean up the name (e.g., "Castellan-AI" becomes "Castellan Ai")
            const cleanName = repo.name.replace(/[-_]/g, ' ');

            card.innerHTML = `
                <h3 style="text-transform: capitalize;">${cleanName}</h3>
                <p>${repo.description || 'System architecture and AI infrastructure development.'}</p>
                <div class="tags">
                    ${topics.length > 0 
                        ? topics.map(t => `<span>#${t}</span>`).join('') 
                        : '<span>#AI-Engineering</span>'}
                </div>
                <a href="${repo.html_url}" target="_blank">View Source →</a>
            `;
            grid.appendChild(card);
        });

    } catch (error) {
        console.error("Critical Script Error:", error);
        grid.innerHTML = `<p>Something went wrong: ${error.message}</p>`;
    }
}

// Run when the page is ready
window.addEventListener('DOMContentLoaded', fetchProjects);
