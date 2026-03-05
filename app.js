marked.setOptions({
    breaks: true,
    gfm: true,
    headerIds: true,
    highlight: function(code, lang) {
        if (lang && hljs.getLanguage(lang)) {
            try {
                return hljs.highlight(code, { language: lang }).value;
            } catch (e) {
                console.error(e);
            }
        }
        return hljs.highlightAuto(code).value;
    }
});

const editor = document.getElementById('editor');
const preview = document.getElementById('preview');
const wordCount = document.getElementById('wordCount');
const downloadBtn = document.getElementById('downloadBtn');
const openFileBtn = document.getElementById('openFileBtn');
const fileInput = document.getElementById('fileInput');
const resizer = document.getElementById('resizer');
const previewPanel = document.getElementById('previewPanel');
const fullscreenBtn = document.getElementById('fullscreenBtn');
const boldBtn = document.getElementById('boldBtn');
const italicBtn = document.getElementById('italicBtn');
const h1Btn = document.getElementById('h1Btn');
const h2Btn = document.getElementById('h2Btn');
const h3Btn = document.getElementById('h3Btn');
const linkBtn = document.getElementById('linkBtn');
const imageBtn = document.getElementById('imageBtn');
const codeBtn = document.getElementById('codeBtn');
const inlineCodeBtn = document.getElementById('inlineCodeBtn');
const quoteBtn = document.getElementById('quoteBtn');
const ulBtn = document.getElementById('ulBtn');
const olBtn = document.getElementById('olBtn');
const taskBtn = document.getElementById('taskBtn');
const tableBtn = document.getElementById('tableBtn');
const hrBtn = document.getElementById('hrBtn');
const collapseBtn = document.getElementById('collapseBtn');
const mathBtn = document.getElementById('mathBtn');
const resetBtn = document.getElementById('resetBtn');
const themesBtn = document.getElementById('themesBtn');
const themeModal = document.getElementById('themeModal');
const themeItems = document.querySelectorAll('.theme-item');

let currentFileName = 'document.md';

const sampleMarkdown = `# Welcome to Markd ✨

A **modern**, feature-rich markdown editor with live preview.

## Features

- 📝 **Live Preview** - See your changes in real-time
- 🎨 **Syntax Highlighting** - Beautiful code blocks
- 🌙 **Dark/Light Theme** - Easy on the eyes
- 💾 **Download** - Export your markdown files
- ⌨️ **Keyboard Shortcuts** - Work faster

## Code Example

\`\`\`javascript
function greet(name) {
    return \`Hello, \${name}! Welcome to Markd.\`;
}

console.log(greet('Developer'));
\`\`\`

## Task List

- [x] Create the editor
- [x] Add live preview
- [x] Implement dark mode
- [ ] Add more features

## Blockquote

> "The best way to predict the future is to create it."
> — Peter Drucker

## Table Example

| Feature | Status | Priority |
|---------|--------|----------|
| Editor | ✅ Done | High |
| Preview | ✅ Done | High |
| Export | ✅ Done | Medium |
| Themes | ✅ Done | Medium |

## Links & Images

Check out [GitHub](https://github.com) for more projects!

---

*Start editing to see the magic happen!* 🚀
`;

function init() {
    // Clear any URL hash to prevent browser scroll issues
    if (window.location.hash) {
        history.replaceState(null, '', window.location.pathname);
    }
    
    const savedContent = localStorage.getItem('markd-content');
    editor.value = savedContent || sampleMarkdown;
    
    const savedTheme = localStorage.getItem('markd-theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    applyCustomTheme();
    loadSavedLogo();
    renderMarkdown();
    updateCounts();
    setupEventListeners();
    setupResizer();
}

function loadSavedLogo() {
    const savedLogoSvg = localStorage.getItem('markd-logo-svg');
    const headerLogo = document.getElementById('headerLogo');
    const tagline = '<span class="tagline">Clean code. Beautiful docs.</span>';
    
    if (savedLogoSvg && headerLogo) {
        const logoStyle = localStorage.getItem('markd-logo-style');
        
        if (logoStyle === 'emoji') {
            headerLogo.innerHTML = `<span style="font-size: 24px;">${savedLogoSvg}</span><span>Markd</span>${tagline}`;
        } else {
            const parser = new DOMParser();
            const svgDoc = parser.parseFromString(savedLogoSvg, 'image/svg+xml');
            const svg = svgDoc.querySelector('svg');
            
            if (svg) {
                svg.setAttribute('width', '28');
                svg.setAttribute('height', '28');
                headerLogo.innerHTML = svg.outerHTML + `<span>Markd</span>${tagline}`;
            }
        }
    }
}

function togglePreviewFullscreen() {
    previewPanel.classList.toggle('fullscreen');
    
    const isFullscreen = previewPanel.classList.contains('fullscreen');
    const editorPanel = document.querySelector('.editor-panel');
    const resizerEl = document.getElementById('resizer');
    const header = document.querySelector('.header');
    
    if (isFullscreen) {
        editorPanel.style.display = 'none';
        resizerEl.style.display = 'none';
        header.style.display = 'none';
        document.body.style.overflow = 'auto';
    } else {
        editorPanel.style.display = '';
        resizerEl.style.display = '';
        header.style.display = '';
        document.body.style.overflow = '';
    }
}

function applyCustomTheme() {
    const themeData = localStorage.getItem('markd-theme-data');
    if (themeData) {
        try {
            const theme = JSON.parse(themeData);
            applyThemeColors(theme);
        } catch (e) {
            console.error('Error applying custom theme:', e);
        }
    } else {
        applyThemeColors(themes['github-light']);
        localStorage.setItem('markd-theme-data', JSON.stringify(themes['github-light']));
        localStorage.setItem('markd-selected-theme', 'github-light');
    }
}

// Theme definitions
const themes = {
    midnight: {
        name: 'Midnight Blue',
        mode: 'dark',
        bgPrimary: '#0f172a',
        bgSecondary: '#1e293b',
        bgTertiary: '#334155',
        bgHover: '#475569',
        textPrimary: '#f1f5f9',
        textSecondary: '#cbd5e1',
        textTertiary: '#64748b',
        borderColor: '#334155',
        borderLight: '#1e293b',
        accentColor: '#3b82f6',
        accentHover: '#60a5fa',
        accentLight: '#1e3a5f',
        codeBg: '#1e293b',
        blockquoteBorder: '#3b82f6',
        linkColor: '#60a5fa'
    },
    dracula: {
        name: 'Dracula',
        mode: 'dark',
        bgPrimary: '#21222c',
        bgSecondary: '#282a36',
        bgTertiary: '#343746',
        bgHover: '#44475a',
        textPrimary: '#f8f8f2',
        textSecondary: '#f8f8f2',
        textTertiary: '#6272a4',
        borderColor: '#44475a',
        borderLight: '#343746',
        accentColor: '#bd93f9',
        accentHover: '#ff79c6',
        accentLight: '#343746',
        codeBg: '#282a36',
        blockquoteBorder: '#bd93f9',
        linkColor: '#8be9fd'
    },
    'catppuccin-mocha': {
        name: 'Catppuccin Mocha',
        mode: 'dark',
        bgPrimary: '#1e1e2e',
        bgSecondary: '#313244',
        bgTertiary: '#45475a',
        bgHover: '#585b70',
        textPrimary: '#cdd6f4',
        textSecondary: '#bac2de',
        textTertiary: '#a6adc8',
        borderColor: '#45475a',
        borderLight: '#313244',
        accentColor: '#cba6f7',
        accentHover: '#f5c2e7',
        accentLight: '#181825',
        codeBg: '#313244',
        blockquoteBorder: '#cba6f7',
        linkColor: '#89b4fa'
    },
    onedark: {
        name: 'One Dark',
        mode: 'dark',
        bgPrimary: '#1e2127',
        bgSecondary: '#282c34',
        bgTertiary: '#3e4451',
        bgHover: '#4b5263',
        textPrimary: '#d7dae0',
        textSecondary: '#abb2bf',
        textTertiary: '#7f848e',
        borderColor: '#3e4451',
        borderLight: '#282c34',
        accentColor: '#61afef',
        accentHover: '#528bff',
        accentText: '#1e2127',
        accentLight: '#2c313a',
        codeBg: '#282c34',
        blockquoteBorder: '#61afef',
        linkColor: '#61afef'
    },
    monokai: {
        name: 'Monokai Pro',
        mode: 'dark',
        bgPrimary: '#19181a',
        bgSecondary: '#2d2a2e',
        bgTertiary: '#403e41',
        bgHover: '#525053',
        textPrimary: '#fcfcfa',
        textSecondary: '#c1c0c0',
        textTertiary: '#939293',
        borderColor: '#403e41',
        borderLight: '#2d2a2e',
        accentColor: '#ffd866',
        accentHover: '#e6c250',
        accentText: '#19181a',
        accentLight: '#221f22',
        codeBg: '#2d2a2e',
        blockquoteBorder: '#ff6188',
        linkColor: '#78dce8'
    },
    'github-dark': {
        name: 'GitHub Dark',
        mode: 'dark',
        bgPrimary: '#0d1117',
        bgSecondary: '#161b22',
        bgTertiary: '#21262d',
        bgHover: '#30363d',
        textPrimary: '#c9d1d9',
        textSecondary: '#8b949e',
        textTertiary: '#6e7681',
        borderColor: '#30363d',
        borderLight: '#21262d',
        accentColor: '#58a6ff',
        accentHover: '#79c0ff',
        accentLight: '#21262d',
        codeBg: '#161b22',
        blockquoteBorder: '#3b5998',
        linkColor: '#58a6ff'
    },
    onelight: {
        name: 'One Light',
        mode: 'light',
        bgPrimary: '#fafafa',
        bgSecondary: '#f0f0f0',
        bgTertiary: '#e5e5e6',
        bgHover: '#d4d4d5',
        textPrimary: '#383a42',
        textSecondary: '#4f525e',
        textTertiary: '#696c77',
        borderColor: '#dbdbdc',
        borderLight: '#e5e5e6',
        accentColor: '#4078f2',
        accentHover: '#3269e6',
        accentLight: '#eaeaeb',
        codeBg: '#f0f0f0',
        blockquoteBorder: '#4078f2',
        linkColor: '#4078f2'
    },
    'github-light': {
        name: 'GitHub Light',
        mode: 'light',
        bgPrimary: '#ffffff',
        bgSecondary: '#f6f8fa',
        bgTertiary: '#eff2f5',
        bgHover: '#e1e4e8',
        textPrimary: '#24292f',
        textSecondary: '#57606a',
        textTertiary: '#6e7781',
        borderColor: '#d0d7de',
        borderLight: '#e1e4e8',
        accentColor: '#0969da',
        accentHover: '#0860ca',
        accentLight: '#f6f8fa',
        codeBg: '#f6f8fa',
        blockquoteBorder: '#0969da',
        linkColor: '#0969da'
    }
};

function applyThemeColors(theme) {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme.mode);
    root.style.setProperty('--bg-primary', theme.bgPrimary);
    root.style.setProperty('--bg-secondary', theme.bgSecondary);
    root.style.setProperty('--bg-tertiary', theme.bgTertiary);
    root.style.setProperty('--bg-hover', theme.bgHover);
    root.style.setProperty('--text-primary', theme.textPrimary);
    root.style.setProperty('--text-secondary', theme.textSecondary);
    root.style.setProperty('--text-tertiary', theme.textTertiary);
    root.style.setProperty('--border-color', theme.borderColor);
    root.style.setProperty('--border-light', theme.borderLight);
    root.style.setProperty('--accent-color', theme.accentColor);
    root.style.setProperty('--accent-hover', theme.accentHover);
    root.style.setProperty('--accent-light', theme.accentLight);
    root.style.setProperty('--code-bg', theme.codeBg);
    root.style.setProperty('--blockquote-border', theme.blockquoteBorder);
    root.style.setProperty('--link-color', theme.linkColor);
    if (theme.accentText) {
        root.style.setProperty('--accent-text', theme.accentText);
    } else {
        root.style.removeProperty('--accent-text');
    }
    
    if (typeof mermaid !== 'undefined') {
        mermaid.initialize({
            startOnLoad: false,
            theme: theme.mode === 'dark' ? 'dark' : 'default',
            securityLevel: 'loose'
        });
        renderMarkdown();
    }
}

// Theme modal state
let savedThemeData = null;
let savedThemeName = null;
let focusedThemeIndex = 0;
const themeKeys = Object.keys(themes);

function openThemeModal() {
    savedThemeData = localStorage.getItem('markd-theme-data');
    savedThemeName = localStorage.getItem('markd-selected-theme');
    
    focusedThemeIndex = savedThemeName ? themeKeys.indexOf(savedThemeName) : 0;
    if (focusedThemeIndex === -1) focusedThemeIndex = 0;
    
    updateThemeFocus();
    
    themeModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function updateThemeFocus() {
    themeItems.forEach((item, index) => {
        item.classList.remove('selected', 'focused');
        if (item.dataset.theme === savedThemeName) {
            item.classList.add('selected');
        }
        if (index === focusedThemeIndex) {
            item.classList.add('focused');
            item.scrollIntoView({ block: 'nearest' });
            // Preview the focused theme
            previewTheme(item.dataset.theme);
        }
    });
}

function closeThemeModal(revert = true) {
    if (revert && savedThemeData) {
        // Revert to saved theme
        const theme = JSON.parse(savedThemeData);
        applyThemeColors(theme);
    } else if (revert && !savedThemeData) {
        // Revert to default dark theme
        resetThemeColors();
    }
    
    themeModal.classList.remove('active');
    document.body.style.overflow = '';
}

function resetThemeColors() {
    const root = document.documentElement;
    root.setAttribute('data-theme', 'dark');
    root.style.removeProperty('--bg-primary');
    root.style.removeProperty('--bg-secondary');
    root.style.removeProperty('--bg-tertiary');
    root.style.removeProperty('--bg-hover');
    root.style.removeProperty('--text-primary');
    root.style.removeProperty('--text-secondary');
    root.style.removeProperty('--text-tertiary');
    root.style.removeProperty('--border-color');
    root.style.removeProperty('--border-light');
    root.style.removeProperty('--accent-color');
    root.style.removeProperty('--accent-hover');
    root.style.removeProperty('--accent-light');
    root.style.removeProperty('--accent-text');
    root.style.removeProperty('--code-bg');
    root.style.removeProperty('--blockquote-border');
    root.style.removeProperty('--link-color');
}

function previewTheme(themeName) {
    const theme = themes[themeName];
    if (theme) {
        applyThemeColors(theme);
    }
}

function selectTheme(themeName) {
    const theme = themes[themeName];
    if (theme) {
        localStorage.setItem('markd-selected-theme', themeName);
        localStorage.setItem('markd-theme-data', JSON.stringify(theme));
        localStorage.setItem('markd-theme', theme.mode);
        applyThemeColors(theme);
        
        themeItems.forEach(item => item.classList.remove('selected'));
        document.querySelector(`[data-theme="${themeName}"]`)?.classList.add('selected');
        closeThemeModal(false);
    }
}

function renderMarkdown() {
    let markdown = editor.value;
    
    const footnotes = {};
    let footnoteIndex = 0;
    
    // Extract footnote definitions [^id]: content
    markdown = markdown.replace(/^\[\^([^\]]+)\]:\s*(.+)$/gm, (match, id, content) => {
        footnoteIndex++;
        footnotes[id] = { index: footnoteIndex, content: content.trim() };
        return ''; // Remove definition from main text
    });
    
    // Protect math blocks from being parsed by marked
    const mathBlocks = [];
    
    // Extract display math ($$...$$)
    markdown = markdown.replace(/\$\$([\s\S]*?)\$\$/g, (match, math) => {
        mathBlocks.push({ type: 'display', content: math.trim() });
        return `%%MATH_BLOCK_${mathBlocks.length - 1}%%`;
    });
    
    // Extract inline math ($...$) - but not $$ which we already handled
    markdown = markdown.replace(/\$([^\$\n]+?)\$/g, (match, math) => {
        mathBlocks.push({ type: 'inline', content: math.trim() });
        return `%%MATH_INLINE_${mathBlocks.length - 1}%%`;
    });
    
    // Process highlight syntax ==text==
    markdown = markdown.replace(/==([^=]+)==/g, '<mark class="highlight">$1</mark>');
    
    // Process custom heading IDs {#id}
    markdown = markdown.replace(/^(#{1,6})\s+(.+?)\s*\{#([a-z0-9_-]+)\}\s*$/gim, (match, hashes, text, id) => {
        return `${hashes} <span id="${id}">${text}</span>`;
    });
    
    // Process GitHub-style alerts
    markdown = markdown.replace(/^>\s*\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*\n((?:>.*\n?)*)/gim, (match, type, content) => {
        const cleanContent = content.replace(/^>\s?/gm, '').trim();
        const icons = {
            'NOTE': 'ℹ️',
            'TIP': '💡',
            'IMPORTANT': '❗',
            'WARNING': '⚠️',
            'CAUTION': '🔴'
        };
        const parsedContent = marked.parseInline(cleanContent);
        return `<div class="alert alert-${type.toLowerCase()}"><span class="alert-icon">${icons[type.toUpperCase()]}</span><span class="alert-title">${type}</span><div class="alert-content">${parsedContent}</div></div>\n`;
    });
    
    let html = marked.parse(markdown);
    
    // Restore math blocks with KaTeX rendering
    mathBlocks.forEach((block, index) => {
        try {
            const rendered = katex.renderToString(block.content, {
                displayMode: block.type === 'display',
                throwOnError: false
            });
            if (block.type === 'display') {
                html = html.replace(`%%MATH_BLOCK_${index}%%`, `<div class="math-display">${rendered}</div>`);
            } else {
                html = html.replace(`%%MATH_INLINE_${index}%%`, `<span class="math-inline">${rendered}</span>`);
            }
        } catch (e) {
            // If rendering fails, show the original math
            const escaped = block.content.replace(/</g, '&lt;').replace(/>/g, '&gt;');
            if (block.type === 'display') {
                html = html.replace(`%%MATH_BLOCK_${index}%%`, `<div class="math-display math-error">$$${escaped}$$</div>`);
            } else {
                html = html.replace(`%%MATH_INLINE_${index}%%`, `<span class="math-inline math-error">$${escaped}$</span>`);
            }
        }
    });
    
    // Process footnote references [^id] in the HTML
    html = html.replace(/\[\^([^\]]+)\]/g, (match, id) => {
        const footnote = footnotes[id];
        if (footnote) {
            return `<sup class="footnote-ref"><a href="javascript:void(0)" data-target="fn-${id}" id="fnref-${id}">[${footnote.index}]</a></sup>`;
        }
        return match;
    });
    
    if (Object.keys(footnotes).length > 0) {
        html += '<hr class="footnotes-sep"><section class="footnotes"><ol class="footnotes-list">';
        for (const [id, data] of Object.entries(footnotes)) {
            html += `<li id="fn-${id}" class="footnote-item"><p>${data.content} <a href="javascript:void(0)" data-target="fnref-${id}" class="footnote-backref">↩</a></p></li>`;
        }
        html += '</ol></section>';
    }
    
    preview.innerHTML = html;
    renderMermaidDiagrams();
    
    // Setup footnote link handling (only once)
    if (!preview.hasAttribute('data-links-setup')) {
        setupFootnoteLinks();
        preview.setAttribute('data-links-setup', 'true');
    }
}

function setupFootnoteLinks() {
    // Use event delegation to handle all internal link clicks
    preview.addEventListener('click', (e) => {
        // Check for footnote links (data-target) or regular anchor links (href^="#")
        const footnoteLink = e.target.closest('a[data-target]');
        const anchorLink = e.target.closest('a[href^="#"]');
        
        let targetId = null;
        
        if (footnoteLink) {
            e.preventDefault();
            e.stopPropagation();
            targetId = footnoteLink.getAttribute('data-target');
        } else if (anchorLink) {
            e.preventDefault();
            e.stopPropagation();
            const href = anchorLink.getAttribute('href');
            if (href && href !== '#') {
                targetId = href.substring(1);
            }
        }
        
        if (!targetId) return;
        
        const target = document.getElementById(targetId);
        
        if (target && preview.contains(target)) {
            // Calculate scroll position within preview
            const previewRect = preview.getBoundingClientRect();
            const targetRect = target.getBoundingClientRect();
            const scrollTop = preview.scrollTop + (targetRect.top - previewRect.top) - 100;
            preview.scrollTo({ top: Math.max(0, scrollTop), behavior: 'smooth' });
            
            target.style.backgroundColor = 'var(--accent-light)';
            target.style.transition = 'background-color 0.3s ease';
            setTimeout(() => {
                target.style.backgroundColor = '';
            }, 1500);
        }
    }, true); // capture phase
}

function renderMermaidDiagrams() {
    const codeBlocks = preview.querySelectorAll('pre code.language-mermaid');
    codeBlocks.forEach((block, index) => {
        const pre = block.parentElement;
        const code = block.textContent;
        
        const container = document.createElement('div');
        container.className = 'mermaid';
        container.textContent = code;
        
        pre.parentNode.replaceChild(container, pre);
    });
    
    // Re-initialize mermaid to render the new diagrams
    if (typeof mermaid !== 'undefined') {
        mermaid.run();
    }
}

function updateCounts() {
    const text = editor.value;
    const words = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
    
    wordCount.textContent = `${words} word${words !== 1 ? 's' : ''}`;
}

function saveContent() {
    localStorage.setItem('markd-content', editor.value);
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

const debouncedSave = debounce(saveContent, 500);

function setupEventListeners() {
    editor.addEventListener('input', () => {
        renderMarkdown();
        updateCounts();
        debouncedSave();
    });
    
    downloadBtn.addEventListener('click', downloadMarkdown);
    openFileBtn.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', handleFileOpen);
    setupDragAndDrop();
    fullscreenBtn.addEventListener('click', togglePreviewFullscreen);
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && previewPanel.classList.contains('fullscreen')) {
            togglePreviewFullscreen();
        }
    });
    
    boldBtn.addEventListener('click', () => wrapSelection('**', '**'));
    italicBtn.addEventListener('click', () => wrapSelection('*', '*'));
    h1Btn.addEventListener('click', () => insertAtLineStart('# '));
    h2Btn.addEventListener('click', () => insertAtLineStart('## '));
    h3Btn.addEventListener('click', () => insertAtLineStart('### '));
    linkBtn.addEventListener('click', insertLink);
    imageBtn.addEventListener('click', insertImage);
    codeBtn.addEventListener('click', insertCodeBlock);
    inlineCodeBtn.addEventListener('click', () => wrapSelection('`', '`'));
    quoteBtn.addEventListener('click', () => insertAtLineStart('> '));
    ulBtn.addEventListener('click', () => insertAtLineStart('- '));
    olBtn.addEventListener('click', () => insertAtLineStart('1. '));
    taskBtn.addEventListener('click', () => insertAtLineStart('- [ ] '));
    tableBtn.addEventListener('click', insertTable);
    hrBtn.addEventListener('click', insertHorizontalRule);
    collapseBtn.addEventListener('click', insertCollapsible);
    mathBtn.addEventListener('click', insertMath);
    resetBtn.addEventListener('click', resetEditor);
    
    themesBtn.addEventListener('click', openThemeModal);
    themeModal.addEventListener('click', (e) => {
        if (e.target === themeModal) closeThemeModal(true);
    });
    
    themeItems.forEach(item => {
        item.addEventListener('mouseenter', () => {
            focusedThemeIndex = Array.from(themeItems).indexOf(item);
            updateThemeFocus();
        });
        item.addEventListener('click', () => selectTheme(item.dataset.theme));
    });
    
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'e') {
            e.preventDefault();
            if (themeModal.classList.contains('active')) {
                closeThemeModal(true);
            } else {
                openThemeModal();
            }
            return;
        }
        
        if (!themeModal.classList.contains('active')) return;
        
        if (e.key === 'Escape') {
            closeThemeModal(true);
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            focusedThemeIndex = (focusedThemeIndex + 1) % themeItems.length;
            updateThemeFocus();
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            focusedThemeIndex = (focusedThemeIndex - 1 + themeItems.length) % themeItems.length;
            updateThemeFocus();
        } else if (e.key === 'Enter') {
            e.preventDefault();
            const themeName = themeItems[focusedThemeIndex].dataset.theme;
            selectTheme(themeName);
        }
    });
    
    editor.addEventListener('keydown', handleKeyboardShortcuts);
    editor.addEventListener('scroll', syncScroll);
    editor.addEventListener('keydown', handleTabKey);
}

function downloadMarkdown() {
    const content = editor.value;
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = currentFileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function resetEditor() {
    localStorage.removeItem('markd-content');
    editor.value = '';
    renderMarkdown();
    updateCounts();
    currentFileName = 'document.md';
}

function handleFileOpen(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(event) {
        editor.value = event.target.result;
        renderMarkdown();
        updateCounts();
        saveContent();
        currentFileName = file.name;
    };
    reader.onerror = function() {
        alert('Error reading file. Please try again.');
    };
    reader.readAsText(file);
    e.target.value = '';
}

function setupDragAndDrop() {
    const editorPanel = document.querySelector('.editor-panel');
    
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        editorPanel.addEventListener(eventName, preventDefaults, false);
        document.body.addEventListener(eventName, preventDefaults, false);
    });
    
    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    ['dragenter', 'dragover'].forEach(eventName => {
        editorPanel.addEventListener(eventName, () => {
            editorPanel.classList.add('drag-over');
        }, false);
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        editorPanel.addEventListener(eventName, () => {
            editorPanel.classList.remove('drag-over');
        }, false);
    });
    
    editorPanel.addEventListener('drop', handleDrop, false);
}

function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    
    if (files.length > 0) {
        const file = files[0];
        const validExtensions = ['.md', '.markdown', '.txt'];
        const fileName = file.name.toLowerCase();
        
        if (validExtensions.some(ext => fileName.endsWith(ext))) {
            const reader = new FileReader();
            reader.onload = function(event) {
                editor.value = event.target.result;
                renderMarkdown();
                updateCounts();
                saveContent();
                
                // Update filename for future downloads
                currentFileName = file.name;
            };
            reader.onerror = function() {
                alert('Error reading file. Please try again.');
            };
            reader.readAsText(file);
        } else {
            alert('Please drop a markdown file (.md, .markdown, or .txt)');
        }
    }
}

function wrapSelection(prefix, suffix) {
    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    const text = editor.value;
    const selectedText = text.substring(start, end);
    
    const newText = text.substring(0, start) + prefix + selectedText + suffix + text.substring(end);
    editor.value = newText;
    
    // Update cursor position
    editor.selectionStart = start + prefix.length;
    editor.selectionEnd = end + prefix.length;
    editor.focus();
    
    renderMarkdown();
    updateCounts();
    debouncedSave();
}

function insertAtLineStart(prefix) {
    const start = editor.selectionStart;
    const text = editor.value;
    
    // Find the start of the current line
    let lineStart = start;
    while (lineStart > 0 && text[lineStart - 1] !== '\n') {
        lineStart--;
    }
    
    const newText = text.substring(0, lineStart) + prefix + text.substring(lineStart);
    editor.value = newText;
    
    // Update cursor position
    editor.selectionStart = editor.selectionEnd = start + prefix.length;
    editor.focus();
    
    renderMarkdown();
    updateCounts();
    debouncedSave();
}

function insertLink() {
    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    const text = editor.value;
    const selectedText = text.substring(start, end) || 'link text';
    
    const linkMarkdown = `[${selectedText}](url)`;
    const newText = text.substring(0, start) + linkMarkdown + text.substring(end);
    editor.value = newText;
    
    // Select 'url' for easy replacement
    editor.selectionStart = start + selectedText.length + 3;
    editor.selectionEnd = start + selectedText.length + 6;
    editor.focus();
    
    renderMarkdown();
    updateCounts();
    debouncedSave();
}

function insertImage() {
    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    const text = editor.value;
    const selectedText = text.substring(start, end) || 'alt text';
    
    const imageMarkdown = `![${selectedText}](image-url)`;
    const newText = text.substring(0, start) + imageMarkdown + text.substring(end);
    editor.value = newText;
    
    // Select 'image-url' for easy replacement
    editor.selectionStart = start + selectedText.length + 4;
    editor.selectionEnd = start + selectedText.length + 13;
    editor.focus();
    
    renderMarkdown();
    updateCounts();
    debouncedSave();
}

function insertCodeBlock() {
    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    const text = editor.value;
    const selectedText = text.substring(start, end);
    
    const codeBlock = selectedText 
        ? `\n\`\`\`\n${selectedText}\n\`\`\`\n`
        : '\n```language\ncode here\n```\n';
    
    const newText = text.substring(0, start) + codeBlock + text.substring(end);
    editor.value = newText;
    
    editor.focus();
    renderMarkdown();
    updateCounts();
    debouncedSave();
}

function insertTable() {
    const start = editor.selectionStart;
    const text = editor.value;
    
    const table = `\n| Header 1 | Header 2 | Header 3 |
| -------- | -------- | -------- |
| Cell 1   | Cell 2   | Cell 3   |
| Cell 4   | Cell 5   | Cell 6   |\n`;
    
    const newText = text.substring(0, start) + table + text.substring(start);
    editor.value = newText;
    
    editor.focus();
    renderMarkdown();
    updateCounts();
    debouncedSave();
}

function insertHorizontalRule() {
    const start = editor.selectionStart;
    const text = editor.value;
    
    const hr = '\n\n---\n\n';
    
    const newText = text.substring(0, start) + hr + text.substring(start);
    editor.value = newText;
    
    editor.focus();
    renderMarkdown();
    updateCounts();
    debouncedSave();
}

function insertCollapsible() {
    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    const text = editor.value;
    const selectedText = text.substring(start, end);
    
    const collapsible = selectedText 
        ? `\n<details>\n<summary>Click to expand</summary>\n\n${selectedText}\n\n</details>\n`
        : '\n<details>\n<summary>Click to expand</summary>\n\nYour content here...\n\n</details>\n';
    
    const newText = text.substring(0, start) + collapsible + text.substring(end);
    editor.value = newText;
    
    editor.focus();
    renderMarkdown();
    updateCounts();
    debouncedSave();
}

function insertMath() {
    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    const text = editor.value;
    const selectedText = text.substring(start, end);
    
    // If there's selected text, wrap it in inline math
    // Otherwise, insert a block math template
    const math = selectedText 
        ? `$${selectedText}$`
        : '\n$$\nE = mc^2\n$$\n';
    
    const newText = text.substring(0, start) + math + text.substring(end);
    editor.value = newText;
    
    editor.focus();
    renderMarkdown();
    updateCounts();
    debouncedSave();
}

function handleKeyboardShortcuts(e) {
    if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
            case 'b':
                e.preventDefault();
                wrapSelection('**', '**');
                break;
            case 'i':
                e.preventDefault();
                wrapSelection('*', '*');
                break;
            case 'k':
                e.preventDefault();
                insertLink();
                break;
            case 'o':
                e.preventDefault();
                fileInput.click();
                break;
            case 's':
                e.preventDefault();
                downloadMarkdown();
                break;
        }
    }
}

function handleTabKey(e) {
    if (e.key === 'Tab') {
        e.preventDefault();
        const start = editor.selectionStart;
        const end = editor.selectionEnd;
        const text = editor.value;
        
        if (e.shiftKey) {
            // Shift+Tab: Remove indentation
            let lineStart = start;
            while (lineStart > 0 && text[lineStart - 1] !== '\n') {
                lineStart--;
            }
            
            if (text.substring(lineStart, lineStart + 2) === '  ') {
                editor.value = text.substring(0, lineStart) + text.substring(lineStart + 2);
                editor.selectionStart = editor.selectionEnd = Math.max(lineStart, start - 2);
            }
        } else {
            // Tab: Add indentation
            editor.value = text.substring(0, start) + '  ' + text.substring(end);
            editor.selectionStart = editor.selectionEnd = start + 2;
        }
        
        renderMarkdown();
        updateCounts();
        debouncedSave();
    }
}

function syncScroll() {
    const scrollableHeight = editor.scrollHeight - editor.clientHeight;
    if (scrollableHeight <= 0) return;
    
    const editorScrollPercentage = editor.scrollTop / scrollableHeight;
    const previewScrollPosition = editorScrollPercentage * (preview.scrollHeight - preview.clientHeight);
    preview.scrollTop = previewScrollPosition;
}

function setupResizer() {
    let isResizing = false;
    let startX;
    let startWidth;
    
    const editorPanel = document.querySelector('.editor-panel');
    const previewPanel = document.querySelector('.preview-panel');
    
    resizer.addEventListener('mousedown', (e) => {
        isResizing = true;
        startX = e.clientX;
        startWidth = editorPanel.offsetWidth;
        resizer.classList.add('resizing');
        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none';
    });
    
    document.addEventListener('mousemove', (e) => {
        if (!isResizing) return;
        
        const diff = e.clientX - startX;
        const containerWidth = document.querySelector('.main').offsetWidth;
        const newWidth = startWidth + diff;
        
        // Minimum width constraints
        const minWidth = 300;
        const maxWidth = containerWidth - 306; // 300 min + 6 resizer
        
        if (newWidth >= minWidth && newWidth <= maxWidth) {
            const percentage = (newWidth / containerWidth) * 100;
            editorPanel.style.flex = `0 0 ${percentage}%`;
            previewPanel.style.flex = '1';
        }
    });
    
    document.addEventListener('mouseup', () => {
        if (isResizing) {
            isResizing = false;
            resizer.classList.remove('resizing');
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
        }
    });
    
    // Touch support for mobile
    resizer.addEventListener('touchstart', (e) => {
        isResizing = true;
        startX = e.touches[0].clientX;
        startWidth = editorPanel.offsetWidth;
        resizer.classList.add('resizing');
    });
    
    document.addEventListener('touchmove', (e) => {
        if (!isResizing) return;
        
        const diff = e.touches[0].clientX - startX;
        const containerWidth = document.querySelector('.main').offsetWidth;
        const newWidth = startWidth + diff;
        
        const minWidth = 300;
        const maxWidth = containerWidth - 306;
        
        if (newWidth >= minWidth && newWidth <= maxWidth) {
            const percentage = (newWidth / containerWidth) * 100;
            editorPanel.style.flex = `0 0 ${percentage}%`;
            previewPanel.style.flex = '1';
        }
    });
    
    document.addEventListener('touchend', () => {
        if (isResizing) {
            isResizing = false;
            resizer.classList.remove('resizing');
        }
    });
}

if (typeof mermaid !== 'undefined') {
    const savedThemeData = localStorage.getItem('markd-theme-data');
    let mermaidTheme = 'default';
    if (savedThemeData) {
        try {
            const theme = JSON.parse(savedThemeData);
            mermaidTheme = theme.mode === 'dark' ? 'dark' : 'default';
        } catch (e) {}
    }
    mermaid.initialize({
        startOnLoad: false,
        theme: mermaidTheme,
        securityLevel: 'loose'
    });
}

document.addEventListener('DOMContentLoaded', init);
