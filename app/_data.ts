// Content for the landing page. Product names and ingredient lists mirror the
// approved packaging mockup; confirm all copy and claims before launch.

export type Interest = 'skin' | 'hair' | 'body' | 'everything';

export const products = [
  {
    id: 'body-butter',
    name: 'Body Butter',
    line: 'Body care',
    tagline: 'Rich, whipped comfort for everyday skin.',
    ingredients: ['Shea butter', 'Cocoa butter', 'Baobab'],
    image: '/images/product-butter.jpg',
    interest: 'body' as Interest,
    accent: '#A76545',
  },
  {
    id: 'hair-oil',
    name: 'Hair Oil',
    line: 'Hair care',
    tagline: 'A few drops of nourishment for scalp and strands.',
    ingredients: ['Baobab', 'Botanical oils'],
    image: '/images/product-oil.jpg',
    interest: 'hair' as Interest,
    accent: '#77775A',
  },
  {
    id: 'cleansing-bar',
    name: 'Cleansing Bar',
    line: 'Cleansing',
    tagline: 'A considered, gentle start to your routine.',
    ingredients: ['Shea butter', 'Cocoa butter', 'Botanicals'],
    image: '/images/product-bar.jpg',
    interest: 'skin' as Interest,
    accent: '#4A3027',
  },
];

export const chapters = [
  {
    kicker: 'Chapter 01',
    word: 'Rooted',
    title: 'It begins in Nigerian soil.',
    body: 'Shea, cocoa and baobab have cared for skin and hair across West Africa for generations. We start with what grows close to home.',
    image: '/images/story-source.jpg',
    alt: 'Dense green leaves',
  },
  {
    kicker: 'Chapter 02',
    word: 'Crafted',
    title: 'Then it is made with intention.',
    body: 'Considered ingredient choices, clear labels and nothing harsh. Every formula has to earn its place on your shelf.',
    image: '/images/story-craft.jpg',
    alt: 'Hands holding an amber dropper bottle of oil',
  },
  {
    kicker: 'Chapter 03',
    word: 'Ritual',
    title: 'It becomes a moment for you.',
    body: 'Rich textures, warm scents and a few quiet minutes. Daily care that feels good and fits real life.',
    image: '/images/story-ritual.jpg',
    alt: 'A drop of golden oil on skin',
  },
  {
    kicker: 'Chapter 04',
    word: 'Glow',
    title: 'And you carry it with you.',
    body: 'Nourished skin, cared-for hair and a natural radiance that is entirely your own.',
    image: '/images/story-glow.jpg',
    alt: 'A woman with natural hair, eyes closed, at golden hour',
  },
];

export const ingredients = [
  {
    id: 'shea',
    name: 'Shea butter',
    origin: 'From the nuts of the shea tree, native to the West African savannah.',
    feel: 'Rich and cushioning',
    note: 'A West African staple for softening and comforting dry skin, passed down through generations.',
    foundIn: ['Body Butter', 'Cleansing Bar'],
  },
  {
    id: 'cocoa',
    name: 'Cocoa butter',
    origin: 'Pressed from cocoa beans. Nigeria is one of the world’s leading cocoa growers.',
    feel: 'Velvety and warm',
    note: 'A naturally firm butter that melts on contact with skin, with a soft chocolate scent.',
    foundIn: ['Body Butter', 'Cleansing Bar'],
  },
  {
    id: 'baobab',
    name: 'Baobab',
    origin: 'From the seeds of the baobab, Africa’s iconic “tree of life”.',
    feel: 'Light and silky',
    note: 'A lightweight oil that absorbs easily, so skin and hair feel nourished, not greasy.',
    foundIn: ['Body Butter', 'Hair Oil'],
  },
];

export const promises = [
  { title: 'Pure ingredients', body: 'No harsh chemicals. Just nature’s best.' },
  { title: 'Nigerian heritage', body: 'Locally sourced, proudly African.' },
  { title: 'Kind to your body', body: 'What you put on your skin matters inside too.' },
  { title: 'Visible, lasting care', body: 'Real nourishment. Natural radiance.' },
];

export const perks = [
  { title: 'First access', body: 'Shop the first batch before it opens to everyone.' },
  { title: 'Ingredient stories', body: 'Where our shea, cocoa and baobab come from, and why.' },
  { title: 'A say in what’s next', body: 'Vote on scents, sizes and the next product we make.' },
];

export const faqs = [
  {
    q: 'When does Gourmet Glow launch?',
    a: 'We’re finalising our first collection now. Founding list members hear first and get access before anyone else.',
  },
  {
    q: 'What’s in the first collection?',
    a: 'Three essentials: a Body Butter, a Hair Oil and a Cleansing Bar, built around shea butter, cocoa butter and baobab.',
  },
  {
    q: 'Where do your ingredients come from?',
    a: 'We source locally in Nigeria wherever we can and will share the story behind each ingredient as we go.',
  },
  {
    q: 'Will I get spammed if I join?',
    a: 'No. Expect a handful of thoughtful emails: launch news, ingredient stories and early access. Unsubscribe anytime.',
  },
];

export const quiz = [
  {
    q: 'What does your routine need most right now?',
    options: [
      { label: 'Skin that feels soft and comforted', value: 'body' },
      { label: 'Hair that feels nourished', value: 'hair' },
      { label: 'A gentle, fresh cleanse', value: 'skin' },
      { label: 'Honestly? All of it', value: 'everything' },
    ],
  },
  {
    q: 'How do you like your care to feel?',
    options: [
      { label: 'Rich and cocooning', value: 'rich' },
      { label: 'Light and quick', value: 'light' },
      { label: 'Somewhere in between', value: 'balanced' },
    ],
  },
] as const;

export const navLinks = [
  { href: '#collection', label: 'Collection' },
  { href: '#story', label: 'Our Story' },
  { href: '#ingredients', label: 'Ingredients' },
  { href: '#finder', label: 'Glow Finder' },
  { href: '#faq', label: 'FAQ' },
];
