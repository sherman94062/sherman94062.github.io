const GITHUB_USERNAME = 'YourGitHubUsername'; // Replace with yours

async function fetchProjects() {
    const response = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated`);
    const repos = await response.json();
    const grid = document.getElementById('project-grid');
    grid.innerHTML = ''; 

    repos.forEach(repo => {
        // Only show repos tagged with 'ai' or 'portfolio'
        if (repo.topics.includes('ai')) { 
            const card = document.createElement('div');
            card.className = 'project-card';
            card.innerHTML = `
                <h3>${repo.name.replace(/-/g, ' ')}</h3>
                <p>${repo.description || 'No description provided.'}</p>
                <div class="tags">${repo.topics.map(t => `<span>#${t}</span>`).join(' ')}</div>
                <a href="${repo.html_url}" target="_blank">View Source →</a>
            `;
            grid.appendChild(card);
        }
    });
}

fetchProjects();
