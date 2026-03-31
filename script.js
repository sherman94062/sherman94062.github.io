const GITHUB_USERNAME = 'sherman94062';

async function fetchProjects() {
    const grid = document.getElementById('project-grid');
    if (!grid) return;

    try {
        const response = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=100`);
        const repos = await response.json();

        // 1. CLEAR THE LOADING MESSAGE
        grid.innerHTML = '';

        // 2. CHECK IF REPOS EXIST
        if (!Array.isArray(repos) || repos.length === 0) {
            grid.innerHTML = "<p>No public repos found. Check if they are 'Public' in GitHub Settings.</p>";
            return;
        }

        // 3. LOOP THROUGH REPOS
        repos.forEach(repo => {
            try {
                // Skip the portfolio site itself
                if (repo.name.includes('github.io')) return;

                const card = document.createElement('div');
                card.className = 'project-card';
                
                // Safely handle description and topics
                const desc = repo.description || "AI Engineering and Infrastructure project.";
                const topics = Array.isArray(repo.topics) ? repo.topics : [];
                const tagsHTML = topics.length > 0 
                    ? topics.map(t => `<span>#${t}</span>`).join(' ') 
                    : '<span>#AI</span><span>#Python</span>';

                card.innerHTML = `
                    <h3>${repo.name.replace(/-/g, ' ')}</h3>
                    <p>${desc}</p>
                    <div class="tags">${tagsHTML}</div>
                    <a href="${repo.html_url}" target="_blank">View Repo →</a>
                `;
                grid.appendChild(card);
            } catch (innerError) {
                console.error("Skipping a repo due to error:", innerError);
            }
        });

    } catch (error) {
        grid.innerHTML = `<p>Connection Error: ${error.message}</p>`;
    }
}

// Ensure the page is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fetchProjects);
} else {
    fetchProjects();
}
