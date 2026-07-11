const STORAGE_KEY = 'fitbot-accent-color';
const DEFAULT_ACCENT = '#FF2E3E';

export const PRESET_COLORS = [
    { name: 'Red', value: '#FF2E3E' },
    { name: 'Orange', value: '#FF7A2E' },
    { name: 'Yellow', value: '#F5C518' },
    { name: 'Green', value: '#2ECC71' },
    { name: 'Blue', value: '#3B82F6' },
    { name: 'Purple', value: '#A855F7' },
    { name: 'Pink', value: '#EC4899' },
];

function hexToRgb(hex) {
    const clean = hex.replace('#', '');
    const bigint = parseInt(clean, 16);
    return {
        r: (bigint >> 16) & 255,
        g: (bigint >> 8) & 255,
        b: bigint & 255,
    };
}

function darken(hex, amount = 0.28) {
    const { r, g, b } = hexToRgb(hex);
    const d = (channel) => Math.max(0, Math.round(channel * (1 - amount)));
    const toHex = (channel) => channel.toString(16).padStart(2, '0');
    return `#${toHex(d(r))}${toHex(d(g))}${toHex(d(b))}`;
}

function toRgbaGlow(hex, alpha = 0.35) {
    const { r, g, b } = hexToRgb(hex);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function applyAccentColor(hex) {
    if (!hex || !/^#[0-9A-Fa-f]{6}$/.test(hex)) return;
    const root = document.documentElement;
    root.style.setProperty('--red', hex);
    root.style.setProperty('--red-dim', darken(hex));
    root.style.setProperty('--red-glow', toRgbaGlow(hex));
}

export function saveAccentColor(hex) {
    localStorage.setItem(STORAGE_KEY, hex);
    applyAccentColor(hex);
}

export function resetAccentColor() {
    localStorage.removeItem(STORAGE_KEY);
    applyAccentColor(DEFAULT_ACCENT);
}

export function getSavedAccentColor() {
    return localStorage.getItem(STORAGE_KEY) || DEFAULT_ACCENT;
}

export function initTheme() {
    applyAccentColor(getSavedAccentColor());
}