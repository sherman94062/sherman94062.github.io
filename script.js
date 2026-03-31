const GITHUB_USERNAME = 'sherman94062'; 

async function fetchProjects() {
    const grid = document.getElementById('project-grid');
    
    try {
        // We add a 'timestamp' to the URL to force GitHub to give us fresh data
        const cacheBuster = new Date().getTime();
        const url = `https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=created&per_page=100&t=${cacheBuster}`;
        
        const response = await fetch(url);
        
        if (!response.ok) {
            grid.innerHTML = `<p>GitHub API Status: ${response.status}. Please try again in a moment.</p>`;
            return;
        }

        const repos = await response.json();
        grid.innerHTML = ''; 

        // Filter out your profile site so it doesn't clutter the AI project list
        const filteredRepos = repos.filter(repo => 
            repo.name.toLowerCase() !== `${GITHUB_USERNAME}.github.io`.toLowerCase() && 
            !repo.fork &&
            repo.private === false
        );

        if (filteredRepos.length === 0) {
            grid.innerHTML = "<p>Connected! No other public AI repos detected yet.</p>";
            return;
        }

        filteredRepos.forEach(repo => {
            const card = document.createElement('div');
            card.className = 'project-card';
            
            // Clean up names like 'sqlmesh-ai' to 'SQLMesh AI'
            const cleanName = repo.name.replace(/-/g, ' ').toUpperCase();

            card.innerHTML = `
                <h3>${cleanName}</h3>
                <p>${repo.description || 'AI research and agentic infrastructure development.'}</p>
                <div class="tags">
                    ${(repo.topics && repo.topics.length > 0) 
                        ? repo.topics.map(t => `<span>#${t}</span>`).join('') 
                        : '<span>#AI</span><span>#Python</span>'}
                </div>
                <a href="${repo.html_url}" target="_blank">Explore Code →</a>
            `;
            grid.appendChild(card);
        });

    } catch (error) {
        grid.innerHTML = `<p>Script Error: ${error.message}</p>`;
    }
}

window.addEventListener('DOMContentLoaded', fetchProjects);
