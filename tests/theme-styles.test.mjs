import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { THEME_STYLES } from '../dist/theme/theme.js';

const css = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8');
const styleBlocks = new Map(
  [...css.matchAll(/\[data-theme-style="([^"]+)"\]\s*\{([^}]+)\}/g)].map(([, id, body]) => [id, body]),
);

function token(styleId, name) {
  const block = styleBlocks.get(styleId);
  assert.ok(block, `missing style block: ${styleId}`);
  const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = block.match(new RegExp(`${escapedName}:\\s*([^;]+);`));
  assert.ok(match, `missing ${name} in ${styleId}`);
  return match[1].trim();
}

test('every catalog style defines its own shared surface and header contract', () => {
  assert.equal(styleBlocks.size, THEME_STYLES.length);
  assert.equal(
    [...css.matchAll(/\[data-theme-style="([^"]+)"\]\s*\{/g)].length,
    THEME_STYLES.length,
    'each style must have exactly one token block',
  );
  for (const { id } of THEME_STYLES) {
    for (const name of [
      '--style-surface-bg',
      '--style-border-color',
      '--style-header-bg',
      '--style-header-image',
      '--style-header-border',
      '--style-enter-animation',
    ]) {
      assert.ok(token(id, name), `${id} must define ${name}`);
    }
  }

  assert.ok(new Set(THEME_STYLES.map(({ id }) => token(id, '--style-surface-bg'))).size >= 6);
  assert.ok(new Set(THEME_STYLES.map(({ id }) => token(id, '--style-header-image'))).size >= 7);
  assert.equal(new Set(THEME_STYLES.map(({ id }) => token(id, '--style-enter-animation'))).size, 11);
});

test('shared surfaces consume the style tokens instead of restoring a fixed header treatment', () => {
  assert.match(css, /\.panel-card\s*\{[^}]*background:\s*var\(--style-surface-bg\)/s);
  assert.match(css, /\.panel-card\s*\{[^}]*border:\s*1px solid var\(--style-border-color\)/s);
  assert.match(css, /\.app-header\s*\{[^}]*background-color:\s*var\(--style-header-bg\)/s);
  assert.match(css, /\.app-header\s*\{[^}]*background-image:\s*var\(--style-header-image\)/s);
  assert.match(css, /\.app-header\s*\{[^}]*border:\s*1px solid var\(--style-header-border\)/s);
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
});

test('recognizable signatures remain distinct across the eleven visual styles', () => {
  assert.match(token('classic', '--style-shadow-panel'), /0 2px 10px/);
  assert.match(token('modern', '--style-header-image'), /linear-gradient/);
  assert.match(token('rustic', '--style-font-body'), /Georgia/);
  assert.match(token('corporate', '--style-header-border'), /var\(--accent\)/);
  assert.equal(token('minimal', '--style-shadow-panel'), 'none');
  assert.match(token('frutiger-aero', '--style-panel-blur'), /26px/);
  assert.match(token('neo-brutalism', '--style-shadow-panel'), /0\.4rem 0\.4rem/);
  assert.match(token('glassmorphism', '--style-surface-bg'), /58%/);
  assert.match(token('neumorphism', '--style-shadow-panel'), /-6px -6px/);
  assert.match(token('retro-pixel', '--style-easing'), /steps\(2, end\)/);
  assert.match(token('claymorphism', '--style-shadow-panel'), /inset 0 -4px/);
});
