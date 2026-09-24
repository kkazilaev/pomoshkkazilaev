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
