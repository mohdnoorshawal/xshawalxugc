(() => {
  const items = window.PORTFOLIO_ITEMS || [];
  const grid = document.getElementById('portfolio-grid');
  const chips = [...document.querySelectorAll('.filter-chip')];
  const modal = document.getElementById('media-modal');
  const embedShell = document.getElementById('embed-shell');
  const modalTitle = document.getElementById('modal-title');
  const modalPlatform = document.getElementById('modal-platform');
  const modalType = document.getElementById('modal-type');
  const closeButton = modal?.querySelector('.modal-close');

  function mediaInfo(url = '') {
    const lower = url.toLowerCase();
    if (lower.includes('instagram.com')) {
      const match = url.match(/instagram\.com\/(reel|p)\/([^/?#]+)/i);
      return { platform: 'instagram', label: 'Instagram', format: match?.[1]?.toLowerCase() === 'reel' ? 'Reel' : 'Post', path: match?.[1], id: match?.[2] };
    }
    if (lower.includes('tiktok.com')) {
      const match = url.match(/\/video\/(\d+)/);
      return { platform: 'tiktok', label: 'TikTok', format: 'Video', id: match?.[1] || null };
    }
    return { platform: 'web', label: 'Social', format: 'Content', id: null };
  }

  function cardMarkup(item, index) {
    const media = mediaInfo(item.url);
    return `
      <article class="portfolio-card" tabindex="0" role="button" aria-label="Open ${item.title} on ${media.label}" data-index="${index}">
        <div class="portfolio-media">
          <div class="portfolio-platform"><span class="platform-badge">${media.label.toUpperCase()} ${media.format.toUpperCase()}</span><span class="work-index">0${index + 1}</span></div>
          <div class="media-copy">
            <p>${item.categoryLabel}</p>
            <h3 class="media-title">${item.title}</h3>
          </div>
          <span class="play-disc" aria-hidden="true"></span>
        </div>
        <div class="portfolio-meta">
          <h3>${item.title}</h3>
          <p>${item.categoryLabel}<br>${item.type}</p>
          <span class="portfolio-arrow" aria-hidden="true">↗</span>
        </div>
      </article>`;
  }

  function render(filter = 'All') {
    if (!grid) return;
    grid.innerHTML = items.map((item, index) => ({item, index}))
      .filter(({item}) => filter === 'All' || item.categories.includes(filter))
      .map(({item, index}) => cardMarkup(item, index)).join('');
    grid.querySelectorAll('.portfolio-card').forEach(card => {
      const open = () => openItem(items[Number(card.dataset.index)]);
      card.addEventListener('click', open);
      card.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); }
      });
    });
  }

  function openItem(item) {
    const media = mediaInfo(item.url);
    if (!modal || !embedShell) {
      window.open(item.url, '_blank', 'noopener,noreferrer');
      return;
    }
    modalTitle.textContent = item.title;
    modalPlatform.textContent = `${media.label} ${media.format}`;
    modalType.textContent = `${item.categoryLabel} · ${item.type}`;
    embedShell.innerHTML = '';

    if (media.platform === 'instagram' && media.id && media.path) {
      const iframe = document.createElement('iframe');
      iframe.title = `${item.title} Instagram embed`;
      iframe.loading = 'lazy';
      iframe.allow = 'encrypted-media; picture-in-picture';
      iframe.src = `https://www.instagram.com/${media.path}/${media.id}/embed/`;
      embedShell.appendChild(iframe);
      const sourceLink = document.createElement('a');
      sourceLink.className = 'embed-source-link';
      sourceLink.href = item.url;
      sourceLink.target = '_blank';
      sourceLink.rel = 'noopener noreferrer';
      sourceLink.textContent = 'View on Instagram ↗';
      embedShell.appendChild(sourceLink);
    } else if (media.platform === 'tiktok' && media.id) {
      const iframe = document.createElement('iframe');
      iframe.title = `${item.title} TikTok embed`;
      iframe.loading = 'lazy';
      iframe.allow = 'fullscreen; autoplay; encrypted-media; picture-in-picture';
      iframe.src = `https://www.tiktok.com/player/v1/${media.id}?autoplay=0&loop=0`;
      embedShell.appendChild(iframe);
      const sourceLink = document.createElement('a');
      sourceLink.className = 'embed-source-link';
      sourceLink.href = item.url;
      sourceLink.target = '_blank';
      sourceLink.rel = 'noopener noreferrer';
      sourceLink.textContent = 'View on TikTok ↗';
      embedShell.appendChild(sourceLink);
    } else {
      embedShell.innerHTML = `
        <div class="social-fallback">
          <p class="platform-mark">${media.label.toUpperCase()}</p>
          <h3>${item.title}</h3>
          <p>${item.categoryLabel}<br>${item.type}</p>
          <a class="button button-dark" href="${item.url}" target="_blank" rel="noopener noreferrer">VIEW ON ${media.label.toUpperCase()} <span>↗</span></a>
        </div>`;
    }
    modal.showModal();
  }

  chips.forEach(chip => chip.addEventListener('click', () => {
    chips.forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    render(chip.dataset.filter);
  }));

  closeButton?.addEventListener('click', () => modal.close());
  modal?.addEventListener('click', e => { if (e.target === modal) modal.close(); });
  modal?.addEventListener('close', () => { embedShell.innerHTML = ''; });

  const navToggle = document.querySelector('.nav-toggle');
  const nav = document.getElementById('site-nav');
  navToggle?.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(open));
  });
  nav?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
    nav.classList.remove('open');
    navToggle?.setAttribute('aria-expanded', 'false');
  }));

  render();
})();
