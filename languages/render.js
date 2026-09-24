/* =========================================================
   Общие функции для lang.html и terms.html
   ========================================================= */

// Экранирование HTML
export function esc(str) {
    if (str == null) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

// Рисует секции в контейнер
export function renderSections(container, sections) {
    container.innerHTML = sections.map(sec => `
        <section class="section">
            <h2 class="section__title">${esc(sec.title)}</h2>
            <div class="table">
                ${sec.items.map(item => `
                    <details class="row">
                        <summary class="row__summary">
                            <code class="row__code">${esc(item.code)}</code>
                            <span class="row__desc">${esc(item.desc)}</span>
                        </summary>
                        ${item.detail
                            ? `<div class="row__detail">${esc(item.detail)}</div>`
                            : ''
                        }
                    </details>
                `).join('')}
            </div>
        </section>
    `).join('');
}

// Параллельно грузит массив модулей
export async function loadModules(baseUrl, moduleNames) {
    const results = await Promise.all(
        moduleNames.map(name =>
            fetch(`${baseUrl}${name}.json`)
                .then(r => r.ok ? r.json() : null)
                .catch(() => null)
        )
    );
    return results.filter(Boolean);
}

// Получить ?id= из URL
export function getId() {
    return new URLSearchParams(window.location.search).get('id');
}

// Подсветка активного пункта меню
export function markActiveNav() {
    const path = window.location.pathname;
    const links = document.querySelectorAll('.nav__menu a');

    links.forEach(link => {
        const href = link.getAttribute('href') || '';
        const clean = href
            .replace(/^\.\.\//, '')
            .replace(/^\.\//, '')
            .replace(/\/$/, '');

        if (clean && path.includes(clean)) {
            link.classList.add('is-active');
        }
    });
}

/* =========================================================
   Подсветка и прокрутка к элементу после перехода из поиска
   ========================================================= */
export function highlightFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const hl     = params.get('hl');
    const idx    = params.get('idx');

    if (!hl) return;

    // Ждём, пока renderSections отрисует DOM
    // ищем по всем .row__code с точным совпадением текста
    const tryHighlight = (attempt = 0) => {
        const codes = document.querySelectorAll('.row__code');
        let target  = null;

        if (idx != null) {
            // По индексу — точное попадание
            const num = parseInt(idx, 10);
            if (!isNaN(num) && codes[num]) {
                target = codes[num];
            }
        }

        // Fallback — ищем по тексту
        if (!target) {
            for (const c of codes) {
                if (c.textContent.trim() === hl.trim()) {
                    target = c;
                    break;
                }
            }
        }

        // Если не нашли и попыток < 20 — пробуем снова через 100 мс
        if (!target) {
            if (attempt < 20) {
                setTimeout(() => tryHighlight(attempt + 1), 100);
            }
            return;
        }

        // Нашли! Раскрываем родительский <details>, если есть
        const details = target.closest('details');
        if (details) details.open = true;

        // Прокручиваем к элементу
        setTimeout(() => {
            target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);

        // Подсвечиваем
        target.classList.add('is-highlighted');
        setTimeout(() => {
            target.classList.remove('is-highlighted');
        }, 2500);

        // ─── ЧИСТИМ URL ───────────────────────────────────────────
        const url = new URL(window.location.href);
        url.searchParams.delete('hl');
        url.searchParams.delete('idx');
        window.history.replaceState({}, '', url.pathname + url.search + url.hash);
        // ──────────────────────────────────────────────────────────
    };

    tryHighlight();
}