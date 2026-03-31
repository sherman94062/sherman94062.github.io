const GITHUB_USERNAME = 'sherman94062';

// ── Category definitions ─────────────────────────────────────────────────────
// Repos are matched against these keyword lists (name + description, lowercased).
// First match wins. Order = display priority.
const CATEGORIES = [
  {
    id: 'ai-agents',
    label: '🤖 AI Agents',
    keywords: ['agent', 'multi-agent', 'agentic', 'agentops', 'agentkit',
               'decision-forge', 'owasp', 'web-research', 'job-search-agent',
               'flight-scraper', 'mmlu'],
  },
  {
    id: 'data-engineering',
    label: '🗄️ Data Engineering',
    keywords: ['dbt', 'databricks', 'spark', 'delta', 'sql', 'postgres',
               'clickhouse', 'sqlmesh', 'semantic', 'pipeline', 'medallion',
               'tpc-h', 'nl-to-sql'],
  },
  {
    id: 'llm-tooling',
    label: '🔧 LLM Tooling',
    keywords: ['llm', 'claude', 'openai', 'gemini', 'benchmark', 'eval',
               'langchain', 'langgraph', 'mcp', 'prompt'],
  },
  {
    id: 'governance',
    label: '🛡️ AI Governance',
    keywords: ['castellan', 'governance', 'audit', 'compliance', 'seneschal',
               'lawclaw', 'security', 'rampart'],
  },
  {
    id: 'healthcare',
    label: '🏥 Healthcare AI',
    keywords: ['genomai', 'genomic', 'clinical', 'icu', 'healthcare', 'medical'],
  },
];
const CATEGORY_OTHER = { id: 'other', label: '📁 Other Projects' };

// Repos to always skip
const SKIP = ['github.io'];

// Language badge colors
const LANG_COLORS = {
  Python: '#3572A5', TypeScript: '#3178c6', JavaScript: '#f1e05a',
  HTML: '#e34c26', Shell: '#89e051', Go: '#00ADD8', Rust: '#dea584',
};

// ── Categorise a single repo ─────────────────────────────────────────────────
function categorise(repo) {
  const haystack = `${repo.name} ${repo.description || ''}`.toLowerCase();
  for (const cat of CATEGORIES) {
    if (cat.keywords.some(kw => haystack.includes(kw))) return cat.id;
  }
  return CATEGORY_OTHER.id;
}

// ── Build one card element ───────────────────────────────────────────────────
function buildCard(repo) {
  const desc = repo.description || 'AI Engineering and Infrastructure project.';
  const topics = Array.isArray(repo.topics) ? repo.topics : [];
  const tagsHTML = topics.length > 0
    ? topics.map(t => `<span class="tag">#${t}</span>`).join('')
    : '<span class="tag">#AI</span><span class="tag">#Python</span>';

  const updated = new Date(repo.updated_at);
  const updatedStr = updated.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

  const langBadge = repo.language
    ? `<span class="lang-badge" style="--lang-color:${LANG_COLORS[repo.language] || '#888'}">${repo.language}</span>`
    : '';

  const card = document.createElement('div');
  card.className = 'project-card';
  card.dataset.category = categorise(repo);

  card.innerHTML = `
    <div class="card-header">
      <h3>${repo.name.replace(/-/g, ' ')}</h3>
      ${langBadge}
    </div>
    <p>${desc}</p>
    <div class="tags">${tagsHTML}</div>
    <div class="card-footer">
      <span class="updated">Updated ${updatedStr}</span>
      <a href="${repo.html_url}" target="_blank">View Repo →</a>
    </div>
  `;
  return card;
}

// ── Render filter bar ────────────────────────────────────────────────────────
function buildFilterBar(presentCategoryIds) {
  const bar = document.getElementById('filter-bar');
  if (!bar) return;

  const allCats = [...CATEGORIES, CATEGORY_OTHER].filter(c => presentCategoryIds.has(c.id));

  // "All" button
  const allBtn = document.createElement('button');
  allBtn.className = 'filter-btn active';
  allBtn.dataset.filter = 'all';
  allBtn.textContent = 'All Projects';
  bar.appendChild(allBtn);

  allCats.forEach(cat => {
    const btn = document.createElement('button');
    btn.className = 'filter-btn';
    btn.dataset.filter = cat.id;
    btn.textContent = cat.label;
    bar.appendChild(btn);
  });

  bar.addEventListener('click', e => {
    const btn = e.target.closest('.filter-btn');
    if (!btn) return;
    bar.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const filter = btn.dataset.filter;
    document.querySelectorAll('.project-card').forEach(card => {
      card.style.display = (filter === 'all' || card.dataset.category === filter) ? '' : 'none';
    });
    // Show/hide section headers
    document.querySelectorAll('.section-heading').forEach(h => {
      if (filter === 'all') {
        h.style.display = '';
      } else {
        h.style.display = h.dataset.category === filter ? '' : 'none';
      }
    });
  });
}

// ── Main ─────────────────────────────────────────────────────────────────────
async function fetchProjects() {
  const grid = document.getElementById('project-grid');
  if (!grid) return;

  try {
    const response = await fetch(
      `https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=100`
    );
    const repos = await response.json();

    grid.innerHTML = '';

    if (!Array.isArray(repos) || repos.length === 0) {
      grid.innerHTML = '<p>No public repos found.</p>';
      return;
    }

    // Filter & categorise
    const visible = repos
      .filter(r => !SKIP.some(s => r.name.includes(s)))
      .map(r => ({ ...r, _cat: categorise(r) }));

    // Group by category order
    const allCatIds = [...CATEGORIES.map(c => c.id), CATEGORY_OTHER.id];
    const grouped = {};
    allCatIds.forEach(id => { grouped[id] = []; });
    visible.forEach(r => grouped[r._cat].push(r));

    const presentIds = new Set();

    allCatIds.forEach(catId => {
      const repos = grouped[catId];
      if (repos.length === 0) return;
      presentIds.add(catId);

      const cat = [...CATEGORIES, CATEGORY_OTHER].find(c => c.id === catId);

      // Section heading
      const heading = document.createElement('h2');
      heading.className = 'section-heading';
      heading.dataset.category = catId;
      heading.textContent = cat.label;
      grid.appendChild(heading);

      // Cards
      const section = document.createElement('div');
      section.className = 'section-grid';
      repos.forEach(r => section.appendChild(buildCard(r)));
      grid.appendChild(section);
    });

    buildFilterBar(presentIds);

    // Project count
    const countEl = document.getElementById('project-count');
    if (countEl) countEl.textContent = `${visible.length} projects`;

  } catch (error) {
    grid.innerHTML = `<p>Connection Error: ${error.message}</p>`;
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', fetchProjects);
} else {
  fetchProjects();
}
