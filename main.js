(() => {
  'use strict';
  const p = window.PROFILE;
  if (!p) return;
  const e = value => String(value ?? '').replace(/[&<>"']/g,c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const text = value => typeof value === 'object' && value !== null ? (value.en || value.zh || '') : (value || '');
  function safeUrl(value) {
    const s = String(value || '').trim();
    if (/^(https?:|mailto:)/i.test(s)) return s;
    if (s && !s.includes(':') && !s.startsWith('/') && !s.includes('\\')) return s;
    return '';
  }
  const link = (href,label) => safeUrl(href) ? `<a href="${e(safeUrl(href))}">${label}</a>` : label;
  const inline = value => Array.isArray(value) ? value.map(part => link(part.url,e(text(part.text)))).join('') : e(text(value));
  function section(title,content) { return `<section><table class="section-table" role="presentation"><tbody><tr><td class="section-cell"><h2>${e(title)}</h2>${content}</td></tr></tbody></table></section>`; }
  function paperSection(title,papers,id,expanded) {
    if (!papers.length) return '';
    const rows = papers.map(paper => `<tr class="paper-row"><td class="paper-figure">${paper.image ? link(paper.url,`<img src="${e(safeUrl(paper.image))}" alt="${e(text(paper.imageAlt) || text(paper.title))}" loading="lazy">`) : ''}</td><td class="paper-content"><span class="papertitle">${e(text(paper.title))}</span><br>${paper.authors.map(author => author.replace(/\*/g,'') === p.name ? `<strong>${e(author)}</strong>` : e(author)).join(', ')}<br><em>${e(text(paper.venue))}</em>, ${e(paper.year)}<br>${(paper.links || []).map(resource => link(resource.url,e(resource.label))).join(' / ')}</td></tr>`).join('');
    return `<section aria-labelledby="${id}-heading"><table class="section-table" role="presentation"><tbody><tr><td class="section-cell"><div class="section-heading"><h2 id="${id}-heading">${e(title)}</h2><button class="section-toggle" type="button" data-target="${id}" data-label="${e(title)}" aria-controls="${id}" aria-expanded="${expanded}" aria-label="${expanded ? 'Collapse' : 'Expand'} ${e(title)}"><span class="toggle-chevron" aria-hidden="true"></span></button></div>${title === 'Publications' ? '<p>* indicates equal contribution</p>' : ''}</td></tr></tbody></table><table id="${id}" class="publication-list" role="presentation" ${expanded ? '' : 'hidden'}><tbody>${rows}</tbody></table></section>`;
  }
  const socials = [[p.links.email ? 'mailto:'+p.links.email : '','Email'],[p.links.scholar,'Google Scholar'],[p.links.github,'Github'],[p.links.cv,'CV']].filter(([href]) => safeUrl(href)).map(([href,label]) => link(href,label));
  const education = p.education.length ? section('Education',`<ul class="simple-list">${p.education.map(item => `<li><b title="${e(text(item.degreeTitle) || text(item.degree))}">${e(text(item.degree))}</b> @ <b>${link(item.url,e(text(item.institution)))}</b>, ${e(text(item.date))}${text(item.detail) ? `<br><span>${link(item.detailUrl,e(text(item.detail)))}</span>` : ''}</li>`).join('')}</ul>`) : '';
  const news = p.news.length ? section('News',`<ul class="simple-list">${p.news.map(item => `<li><b>[${e(item.date)}]</b> ${item.linkText ? e(item.lead)+link(item.url,e(item.linkText))+e(item.tail) : link(item.url,e(text(item.text)))}</li>`).join('')}</ul>`) : '';
  const internships = p.internships?.length ? section('Internship','') + `<div class="experience-list">${p.internships.map(item => `<div class="experience-item${item.logo ? '' : ' without-logo'}">${item.logo ? `<div class="company-logo">${link(item.logoUrl,`<img src="${e(safeUrl(item.logo))}" alt="${e(text(item.logoAlt) || text(item.institution))}">`)}</div>` : ''}<div><div class="experience-heading">${link(item.url,`<span class="experience-company">${e(text(item.institution))}</span>`)}<span class="experience-date">${e(text(item.date))}</span></div><div class="experience-role">${e(text(item.role))}</div></div></div>`).join('')}</div>` : '';
  document.getElementById('app').innerHTML = `<a class="skip-link" href="#main">Skip to content</a><main id="main" class="page"><table class="profile-table" role="presentation"><tbody><tr><td class="profile-copy"><h1 class="name">${e(p.name)}</h1><p>I'm currently at the ${link(p.institutionUrl,e(text(p.institution)))}.</p>${p.background ? `<p>${inline(p.background)}</p>` : ''}<p>${e(text(p.researchIntro))}</p><p class="profile-links">${socials.join(' &nbsp;/&nbsp; ')}</p></td><td class="profile-photo">${p.photo ? link(p.photo,`<img src="${e(safeUrl(p.photo))}" alt="${e(p.name)} profile photo">`) : `<div class="photo-placeholder" role="img" aria-label="Profile photo to be added"><span>${e(p.initials)}</span><small>Photo to be added</small></div>`}</td></tr></tbody></table>${education}${news}${paperSection('Publications',p.publications.filter(paper => paper.type !== 'preprint'),'publications-list',true)}${paperSection('Preprints',p.publications.filter(paper => paper.type === 'preprint'),'preprints-list',false)}${internships}<p class="template-credit"><a href="https://github.com/jonbarron/jonbarron_website">Website Template</a></p></main><footer class="site-footer">© ${e(p.name)} | Last updated: ${e(text(p.updated))}</footer>`;
  document.querySelectorAll('.section-toggle').forEach(button => {
    const target = document.getElementById(button.dataset.target);
    const storageKey = 'jingang:'+button.dataset.target;
    function setExpanded(expanded) {
      target.hidden = !expanded;
      button.setAttribute('aria-expanded',String(expanded));
      button.setAttribute('aria-label',(expanded ? 'Collapse ' : 'Expand ')+button.dataset.label);
      button.title = button.getAttribute('aria-label');
      try { sessionStorage.setItem(storageKey,String(expanded)); } catch {}
    }
    let saved = null;
    try { saved = sessionStorage.getItem(storageKey); } catch {}
    setExpanded(saved === null ? button.getAttribute('aria-expanded') === 'true' : saved === 'true');
    button.addEventListener('click',() => setExpanded(button.getAttribute('aria-expanded') !== 'true'));
  });
})();
