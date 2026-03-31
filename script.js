const GITHUB_USERNAME = 'sherman94062';

// ── Pinned at the top as wider featured cards ────────────────────────────────
const FEATURED = [
  'mcp-and-agent-development',
  'agentkit',
  'nl-to-sql-agent',
  'dbt-ai-agent',
  'sqlmesh-ai',
];

// ── Older non-AI repos collapsed into an archive by default ─────────────────
const ARCHIVE = [
  'pushnami', 'resume_creator', 'my-first-binder', 'Flask-RESTful',
  'analytics-app', 'linechart', 'gf-services', 'JenkinsHDFSIntegration',
  'roidnafinal', 'simpleloginwebapp', 'simple-login-web-app',
  'googlepublicapi', 'labtests', 'subsetproblem', 'fizzbuzz',
  'JavaScriptTheGoodParts', 'warp-challenge', 'fastapi',
  'langgraph-agent', 'job-search-ui', 'codex-projects',
];

// ── Category definitions ─────────────────────────────────────────────────────
const CATEGORIES = [
  {
    id: 'ai-agents',
    label: 'AI Agents',
    color: '#22d3ee',
    keywords: ['agent', 'multi-agent', 'agentic', 'agentops', 'agentkit',
               'decision-forge', 'owasp', 'web-research', 'job-search-agent',
               'flight-scraper', 'mmlu', 'temporal', 'claude-agent',
               'minimal-ai', 'multi-agent-cli'],
  },
  {
    id: 'data-engineering',
    label: 'Data Eng',
    color: '#a78bfa',
    keywords: ['dbt', 'databricks', 'spark', 'delta', 'sql', 'postgres',
               'clickhouse', 'sqlmesh', 'semantic', 'pipeline', 'medallion',
               'tpc-h', 'nl-to-sql', 'etl'],
  },
  {
    id: 'llm-tooling',
    label: 'LLM Tooling',
    color: '#34d399',
    keywords: ['llm', 'openai', 'gemini', 'benchmark', 'eval',
               'langchain', 'langgraph', 'mcp', 'prompt'],
  },
  {
    id: 'governance',
    label: 'Governance',
    color: '#fb923c',
    keywords: ['castellan', 'governance', 'audit', 'compliance', 'seneschal',
               'lawclaw', 'security', 'rampart', 'evasion', 'vulnerable'],
  },
];
const CATEGORY_OTHER = { id: 'other', label: 'Other', color: '#64748b' };

const SKIP = ['github.io'];

const LANG_COLORS = {
  Python: '#3b82f6', TypeScript: '#818cf8', JavaScript: '#eab308',
  HTML: '#ef4444', Shell: '#22c55e', Go: '#06b6d4', Ruby: '#ec4899',
};

// ── Helpers ──────────────────────────────────────────────────────────────────
function categorise(repo) {
  const haystack = `${repo.name} ${repo.description || ''}`.toLowerCase();
  for (const cat of CATEGORIES) {
    if (cat.keywords.some(kw => haystack.includes(kw))) return cat;
  }
  return CATEGORY_OTHER;
}

function fmtDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

// ── Card builder ─────────────────────────────────────────────────────────────
function buildCard(repo, featured = false) {
  const cat = categorise(repo);
  const desc = repo.description || 'AI engineering project.';
  const topics = Array.isArray(repo.topics) ? repo.topics : [];
  const tagsHTML = topics.length > 0
    ? topics.slice(0, 6).map(t => `<span class="tag">#${t}</span>`).join('')
    : '';
  const langColor = LANG_COLORS[repo.language] || '#64748b';
  const langBadge = repo.language
    ? `<span class="lang-badge" style="--lc:${langColor}">${repo.language}</span>`
    : '';

  const card = document.createElement('div');
  card.className = 'project-card' + (featured ? ' featured-card' : '');
  card.dataset.category = cat.id;

  card.innerHTML = `
    <div class="card-top">
      <span class="cat-chip" style="--cc:${cat.color}">${cat.label}</span>
      ${langBadge}
    </div>
    <h3>${repo.name.replace(/-/g, ' ')}</h3>
    <p>${desc}</p>
    ${tagsHTML ? `<div class="tags">${tagsHTML}</div>` : ''}
    <div class="card-footer">
      <span class="updated">&#8635; ${fmtDate(repo.updated_at)}</span>
      <a href="${repo.html_url}" target="_blank">View on GitHub &rarr;</a>
    </div>
  `;
  return card;
}

// ── Filter bar ───────────────────────────────────────────────────────────────
function buildFilterBar(presentIds) {
  const bar = document.getElementById('filter-bar');
  if (!bar) return;
  bar.innerHTML = '';

  const allCats = [{ id: 'all', label: 'All' }, ...CATEGORIES, CATEGORY_OTHER]
    .filter(c => c.id === 'all' || presentIds.has(c.id));

  allCats.forEach((cat, i) => {
    const btn = document.createElement('button');
    btn.className = 'filter-btn' + (i === 0 ? ' active' : '');
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

    document.querySelectorAll('#featured-grid .project-card').forEach(card => {
      card.style.display = (filter === 'all' || card.dataset.category === filter) ? '' : 'none';
    });
    const featSection = document.getElementById('featured-section');
    if (featSection) {
      const anyVisible = [...featSection.querySelectorAll('.project-card')]
        .some(c => c.style.display !== 'none');
      featSection.style.display = anyVisible ? '' : 'none';
    }

    document.querySelectorAll('#main-grid .project-card').forEach(card => {
      card.style.display = (filter === 'all' || card.dataset.category === filter) ? '' : 'none';
    });
  });
}

// ── Main ─────────────────────────────────────────────────────────────────────
async function fetchProjects() {
  const root = document.getElementById('project-grid');
  if (!root) return;

  try {
    // The mercy-preview Accept header is required for GitHub to return topics[]
    const res = await fetch(
      `https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=100`,
      { headers: { 'Accept': 'application/vnd.github.mercy-preview+json' } }
    );
    const repos = await res.json();
    root.innerHTML = '';

    if (!Array.isArray(repos) || repos.length === 0) {
      root.innerHTML = '<p>No public repos found.</p>';
      return;
    }

    const visible = repos.filter(r => !SKIP.some(s => r.name.includes(s)));
    const featured = visible.filter(r => FEATURED.includes(r.name))
      .sort((a, b) => FEATURED.indexOf(a.name) - FEATURED.indexOf(b.name));
    const archive  = visible.filter(r => ARCHIVE.includes(r.name));
    const main     = visible.filter(r => !FEATURED.includes(r.name) && !ARCHIVE.includes(r.name));

    const presentIds = new Set(main.concat(featured).map(r => categorise(r).id));

    // ── Featured section ────────────────────────────────────────────────────
    if (featured.length > 0) {
      const sec = document.createElement('div');
      sec.id = 'featured-section';
      sec.innerHTML = '<h2 class="section-label">Featured</h2>';
      const grid = document.createElement('div');
      grid.id = 'featured-grid';
      grid.className = 'featured-grid';
      featured.forEach(r => grid.appendChild(buildCard(r, true)));
      sec.appendChild(grid);
      root.appendChild(sec);
    }

    // ── Main grid ───────────────────────────────────────────────────────────
    const mainSec = document.createElement('div');
    mainSec.innerHTML = '<h2 class="section-label">All Projects</h2>';
    const mainGrid = document.createElement('div');
    mainGrid.id = 'main-grid';
    mainGrid.className = 'main-grid';
    main.forEach(r => mainGrid.appendChild(buildCard(r)));
    mainSec.appendChild(mainGrid);
    root.appendChild(mainSec);

    // ── Archive section ─────────────────────────────────────────────────────
    if (archive.length > 0) {
      const archSec = document.createElement('div');
      archSec.id = 'archive-section';

      const toggle = document.createElement('button');
      toggle.className = 'archive-toggle';
      toggle.textContent = `Show archive (${archive.length} older projects)`;
      archSec.appendChild(toggle);

      const archGrid = document.createElement('div');
      archGrid.className = 'main-grid archive-grid hidden';
      archive.forEach(r => {
        const card = buildCard(r);
        card.classList.add('archive-card');
        archGrid.appendChild(card);
      });
      archSec.appendChild(archGrid);

      toggle.addEventListener('click', () => {
        const hidden = archGrid.classList.toggle('hidden');
        toggle.textContent = hidden
          ? `Show archive (${archive.length} older projects)`
          : `Hide archive`;
      });

      root.appendChild(archSec);
    }

    // ── Filter bar + count ──────────────────────────────────────────────────
    buildFilterBar(presentIds);
    const countEl = document.getElementById('project-count');
    if (countEl) countEl.textContent = `${main.length + featured.length} projects`;

  } catch (err) {
    root.innerHTML = `<p>Error: ${err.message}</p>`;
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', fetchProjects);
} else {
  fetchProjects();
}
