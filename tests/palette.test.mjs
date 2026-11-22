import assert from 'node:assert/strict';
import test from 'node:test';
import { contrastRatio, derivePalette, hexToRgb, rgbToHsl } from '../dist/theme/palette.js';

test('derived palettes preserve readable foreground/background contrast in both modes', () => {
  for (const mode of ['dark', 'light']) {
    const { variables } = derivePalette('#287bc1', mode, 'balanced');
    assert.ok(contrastRatio(variables['--text-primary'], variables['--app-bg']) >= 7);
    assert.equal(variables['--text-primary'] !== variables['--app-bg'], true);
  }
});

test('style color profiles produce deterministic pastel and high-chroma accents', () => {
  const primary = '#287bc1';
  const pastel = derivePalette(primary, 'dark', 'pastel');
  const contrast = derivePalette(primary, 'dark', 'contrast');
  const pastelSaturation = rgbToHsl(...hexToRgb(pastel.variables['--accent'])).s;
  const contrastSaturation = rgbToHsl(...hexToRgb(contrast.variables['--accent'])).s;

  assert.ok(pastelSaturation < contrastSaturation);
  assert.deepEqual(derivePalette(primary, 'dark', 'pastel'), pastel);
});

test('arbitrary accent colours remain readable on surfaces and selected/hover controls', () => {
  for (const primary of [
    '#000000',
    '#ffffff',
    '#ff0000',
    '#00ff00',
    '#0000ff',
    '#ffff00',
    '#ff00ff',
    '#00ffff',
  ]) {
    for (const mode of ['dark', 'light']) {
      for (const profile of ['balanced', 'pastel', 'contrast']) {
        const { variables: v } = derivePalette(primary, mode, profile);
        for (const accent of ['--accent', '--accent-strong']) {
          for (const background of ['--panel-bg', '--toolbar-bg']) {
            assert.ok(
              contrastRatio(v[accent], v[background]) >= 4.5,
              `${primary}/${mode}/${profile}/${accent}/${background}`,
            );
          }
          assert.ok(
            contrastRatio(v[accent], v['--tab-selected-text']) >= 4.5,
            `${primary}/${mode}/${profile}/${accent}/selected`,
          );
        }
      }
    }
  }
});
