// ============================================
// Yalla Car — Pagination Utility (Universal)
// ============================================

(function () {
    'use strict';

    function createPaginator(options) {
        const container = document.querySelector(options.containerSelector);
        if (!container) {
            console.warn('Pagination: container not found →', options.containerSelector);
            return null;
        }

        const itemSelector = options.itemSelector || ':scope > *';
        const rowsPerPage = options.rowsPerPage || 10;
        const allItems = Array.from(container.querySelectorAll(itemSelector));

        if (allItems.length === 0) return null;

        let currentPage = 1;

        // إنشاء حاوية الـ pagination
        const paginationContainer = document.createElement('div');
        paginationContainer.className = 'pagination-container';
        paginationContainer.id = 'pagination-' + Math.random().toString(36).substr(2, 9);
        paginationContainer.style.display = 'none'; // ✅ مخفي افتراضياً

        // مكان الإدراج
        if (options.insertAfterSelector) {
            const afterEl = document.querySelector(options.insertAfterSelector);
            if (afterEl && afterEl.parentNode) {
                afterEl.parentNode.insertBefore(paginationContainer, afterEl.nextSibling);
            }
        } else if (options.insertBeforeSelector) {
            const beforeEl = document.querySelector(options.insertBeforeSelector);
            if (beforeEl && beforeEl.parentNode) {
                beforeEl.parentNode.insertBefore(paginationContainer, beforeEl);
            }
        } else {
            if (container.parentNode) {
                container.parentNode.insertBefore(paginationContainer, container.nextSibling);
            }
        }

        function getMatchingItems() {
            return allItems.filter(function (item) {
                if (item.dataset.matches === '0') return false;
                return true;
            });
        }

        function render() {
            const matchingItems = getMatchingItems();
            const totalPages = Math.ceil(matchingItems.length / rowsPerPage) || 1;

            if (currentPage > totalPages) currentPage = totalPages;
            if (currentPage < 1) currentPage = 1;

            // إخفاء الكل
            allItems.forEach(function (item) {
                item.style.display = 'none';
            });

            // إظهار صفوف الصفحة الحالية
            const start = (currentPage - 1) * rowsPerPage;
            const end = start + rowsPerPage;
            matchingItems.slice(start, end).forEach(function (item) {
                item.style.display = '';
            });

            // ✅ ✅ ✅ الحل الجذري: إخفاء الـ container بالكامل لو صفحة واحدة
            if (totalPages <= 1) {
                paginationContainer.style.display = 'none';
                paginationContainer.innerHTML = '';
                return;
            }

            // إظهار + بناء الأزرار
            paginationContainer.style.display = 'flex';
            buildControls(paginationContainer, {
                currentPage: currentPage,
                totalPages: totalPages,
                totalItems: matchingItems.length,
                start: start + 1,
                end: Math.min(end, matchingItems.length),
                onPageChange: function (page) {
                    currentPage = page;
                    render();
                    const top = paginationContainer.getBoundingClientRect().top + window.scrollY - 150;
                    window.scrollTo({ top: top, behavior: 'smooth' });
                }
            });

            if (typeof options.onRender === 'function') {
                options.onRender(matchingItems, start, end);
            }
        }

        function refresh() {
            currentPage = 1;
            render();
        }

        render();

        return {
            refresh: refresh,
            render: render,
            container: paginationContainer
        };
    }


    function buildControls(container, data) {
        const { currentPage, totalPages, totalItems, start, end, onPageChange } = data;
        const isAr = (localStorage.getItem('lang') || 'ar') === 'ar';

        const infoText = isAr
            ? `عرض <strong>${start}-${end}</strong> من <strong>${totalItems}</strong> نتيجة`
            : `Showing <strong>${start}-${end}</strong> of <strong>${totalItems}</strong>`;

        let buttonsHTML = '';

        buttonsHTML += `
            <button type="button" class="page-btn page-prev" ${currentPage === 1 ? 'disabled' : ''} data-page="${currentPage - 1}" aria-label="${isAr ? 'السابق' : 'Previous'}">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
            </button>
        `;

        const pages = getPageNumbers(currentPage, totalPages);
        pages.forEach(function (p) {
            if (p === '...') {
                buttonsHTML += `<span class="page-ellipsis">...</span>`;
            } else {
                const activeClass = p === currentPage ? ' active' : '';
                buttonsHTML += `<button type="button" class="page-btn${activeClass}" data-page="${p}">${p}</button>`;
            }
        });

        buttonsHTML += `
            <button type="button" class="page-btn page-next" ${currentPage === totalPages ? 'disabled' : ''} data-page="${currentPage + 1}" aria-label="${isAr ? 'التالي' : 'Next'}">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
            </button>
        `;

        container.innerHTML = `
            <div class="pagination-info">${infoText}</div>
            <div class="pagination-controls">${buttonsHTML}</div>
        `;

        container.querySelectorAll('.page-btn[data-page]').forEach(function (btn) {
            btn.addEventListener('click', function () {
                const page = parseInt(this.getAttribute('data-page'));
                if (!isNaN(page) && page !== currentPage) {
                    onPageChange(page);
                }
            });
        });
    }


    function getPageNumbers(current, total) {
        if (total <= 7) {
            const all = [];
            for (let i = 1; i <= total; i++) all.push(i);
            return all;
        }

        const delta = 1;
        const range = [];
        const rangeWithDots = [];
        let l;

        for (let i = 1; i <= total; i++) {
            if (i === 1 || i === total || (i >= current - delta && i <= current + delta)) {
                range.push(i);
            }
        }

        range.forEach(function (i) {
            if (l) {
                if (i - l === 2) {
                    rangeWithDots.push(l + 1);
                } else if (i - l !== 1) {
                    rangeWithDots.push('...');
                }
            }
            rangeWithDots.push(i);
            l = i;
        });

        return rangeWithDots;
    }


    window.YallaPagination = {
        create: createPaginator
    };

    console.log('✅ Universal Pagination loaded');

})();