/**
 * Small fictional business-card design catalogue for Milestone 3.
 * These are CSS-rendered templates, NOT AI-generated images.
 */
export const DESIGN_TEMPLATES = [
  {
    id: 'botanical',
    name: 'Botanical Elegance',
    style: 'Organic elegance',
    brand: 'flora.',
    role: 'CREATIVE DIRECTOR',
    basePalette: 'green',
    typography: 'serif',
    layout: 'spacious',
    rationale: 'A calm, nature-inspired direction with a delicate decorative motif.',
  },
  {
    id: 'minimal',
    name: 'Modern Minimal',
    style: 'Contemporary professional',
    brand: 'FORM /',
    role: 'DESIGN CONSULTANT',
    basePalette: 'navy',
    typography: 'sans',
    layout: 'structured',
    rationale: 'Strong alignment and clear hierarchy create a confident professional feel.',
  },
  {
    id: 'expressive',
    name: 'Creative Expression',
    style: 'Expressive creative',
    brand: 'bloom!',
    role: 'CREATIVE STUDIO',
    basePalette: 'peach',
    typography: 'serif',
    layout: 'dynamic',
    rationale: 'Playful decorative shapes create a more expressive visual identity.',
  },
];

// Each palette has three variations so distinct designs can share a requested colour.
export const PALETTES = {
  green: [
    { label: 'Muted sage green', bg: '#dce7dc', fg: '#315342', accent: '#8fae94' },
    { label: 'Deep forest green', bg: '#263f36', fg: '#f7f5ea', accent: '#9bbda0' },
    { label: 'Soft olive green', bg: '#dde0c4', fg: '#48563a', accent: '#a2ae73' },
  ],
  navy: [
    { label: 'Soft blue-grey', bg: '#dbe3eb', fg: '#293d56', accent: '#8196ad' },
    { label: 'Dark navy', bg: '#26374c', fg: '#ffffff', accent: '#91aacc' },
    { label: 'Dusty midnight blue', bg: '#4e5a76', fg: '#ffffff', accent: '#adb9d0' },
  ],
  blue: [
    { label: 'Pale sky blue', bg: '#dfeaf0', fg: '#2e5670', accent: '#8cb6ca' },
    { label: 'Royal blue', bg: '#325b98', fg: '#ffffff', accent: '#9ec2e5' },
    { label: 'Muted denim blue', bg: '#aec8d8', fg: '#274a62', accent: '#6d97af' },
  ],
  peach: [
    { label: 'Soft blush peach', bg: '#f5d8c9', fg: '#825142', accent: '#de9a87' },
    { label: 'Warm terracotta', bg: '#b96651', fg: '#fff9ef', accent: '#e5aa92' },
    { label: 'Warm peach', bg: '#efc5b2', fg: '#7f453c', accent: '#d48b79' },
  ],
  beige: [
    { label: 'Warm ivory', bg: '#eee8d9', fg: '#5a5546', accent: '#bbb094' },
    { label: 'Deep taupe', bg: '#736658', fg: '#fff9ee', accent: '#c3b49d' },
    { label: 'Sand beige', bg: '#e4d4bd', fg: '#64513e', accent: '#bc9f7d' },
  ],
  purple: [
    { label: 'Light lavender', bg: '#e6dff1', fg: '#59476e', accent: '#b5a0d0' },
    { label: 'Deep violet', bg: '#4f436a', fg: '#fffafd', accent: '#a89ac8' },
    { label: 'Muted lilac', bg: '#d8cfe8', fg: '#584974', accent: '#a995c3' },
  ],
  charcoal: [
    { label: 'Soft graphite', bg: '#d9d9d8', fg: '#35363a', accent: '#98999b' },
    { label: 'Charcoal black', bg: '#28282e', fg: '#faf9f5', accent: '#8a8790' },
    { label: 'Warm grey', bg: '#c8c5c3', fg: '#3e3c40', accent: '#a4a09d' },
  ],
};
