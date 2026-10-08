/* Konfigurasi MathJax dan Tailwind CSS.
   Dimuat SETELAH Tailwind CDN dan SEBELUM MathJax CDN. */

window.MathJax = {
    tex: {
        inlineMath: [['$', '$'], ['\\(', '\\)']],
        displayMath: [['$$', '$$'], ['\\[', '\\]']],
        processEscapes: true
    },
    options: {
        skipHtmlTags: ['script', 'noscript', 'style', 'textarea', 'pre', 'code']
    },
    svg: {
        fontCache: 'global'
    }
};

if (typeof tailwind !== 'undefined') {
    tailwind.config = {
        darkMode: 'class',
        theme: {
            extend: {
                colors: {
                    brand: {
                        50: '#f0f9ff',
                        100: '#e0f2fe',
                        400: '#38bdf8',
                        500: '#0ea5e9',
                        600: '#0284c7',
                        800: '#075985',
                        900: '#0c4a6e',
                    }
                }
            }
        }
    }
}
