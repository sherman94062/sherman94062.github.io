const GITHUB_USERNAME = 'sherman94062'; 

async function fetchProjects() {
    console.log("Attempting to fetch projects..."); // Check your console (F12) for this
    
    try {
        const response = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated`);
        const repos = await response.json();
        
        const grid = document.getElementById('project-grid');
        
        if (!grid) {
            console.error("Could not find the 'project-grid' element in your HTML!");
            return;
        }

        grid.innerHTML = ''; 

        repos.forEach(repo => {
            // Filter out the profile README or forks if you want
            if (repo.name === GITHUB_USERNAME || repo.fork) return;

            const card = document.createElement('div');
            card.className = 'project-card';
            card.innerHTML = `
                <h3>${repo.name.replace(/-/g, ' ')}</h3>
                <p>${repo.description || 'AI Engineering & Infrastructure project.'}</p>
                <div class="tags">${repo.topics.length ? repo.topics.map(t => `<span>#${t}</span>`).join(' ') : '<span>#general</span>'}</div>
                <a href="${repo.html_url}" target="_blank">View Source →</a>
            `;
            grid.appendChild(card);
        });
        
        console.log(`Successfully injected ${repos.length} repos.`);
    } catch (error) {
        console.error("Error fetching GitHub data:", error);
    }
}

// THIS IS THE KEY CHANGE:
// Waits for the HTML to be fully loaded before running the function
window.addEventListener('DOMContentLoaded', fetchProjects);
