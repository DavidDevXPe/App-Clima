// @vitest-environment node

import { readFile } from 'node:fs/promises';
import { JSDOM } from 'jsdom';
import { describe, expect, it } from 'vitest';

const siteUrl = 'https://atmos-clima.netlify.app/';
const socialImageUrl = `${siteUrl}og-atmos.png`;
const projectRoot = new URL('../', import.meta.url);

const [indexHtml, readme, socialImage] = await Promise.all([
  readFile(new URL('index.html', projectRoot), 'utf8'),
  readFile(new URL('README.md', projectRoot), 'utf8'),
  readFile(new URL('public/og-atmos.png', projectRoot)),
]);

const document = new JSDOM(indexHtml).window.document;

describe('metadatos del despliegue público', () => {
  it.each([
    ['URL canónica', 'link[rel="canonical"]', 'href', siteUrl],
    ['Open Graph URL', 'meta[property="og:url"]', 'content', siteUrl],
    ['Open Graph image', 'meta[property="og:image"]', 'content', socialImageUrl],
    [
      'Open Graph secure image',
      'meta[property="og:image:secure_url"]',
      'content',
      socialImageUrl,
    ],
    ['Twitter image', 'meta[name="twitter:image"]', 'content', socialImageUrl],
  ])('declara una única %s correcta', (_name, selector, attribute, expectedValue) => {
    const elements = document.querySelectorAll(selector);

    expect(elements).toHaveLength(1);
    expect(elements[0].getAttribute(attribute)).toBe(expectedValue);
  });

  it('publica una imagen social local no vacía', () => {
    expect(socialImage.byteLength).toBeGreaterThan(0);
  });

  it('documenta la demo y los endpoints con el dominio oficial', () => {
    expect(readme).toContain(`[${siteUrl}](${siteUrl})`);
    expect(readme).toContain(`${siteUrl}api/health`);
    expect(readme).toContain(`${siteUrl}api/weather?city=Paita`);
  });

  it('no conserva dominios de despliegue antiguos o incorrectos', () => {
    const deploymentHosts = [
      ...new Set(
        [...`${indexHtml}\n${readme}`.matchAll(
          /https:\/\/([a-z0-9-]+\.(?:netlify\.app|vercel\.app))/gi,
        )].map((match) => match[1].toLowerCase()),
      ),
    ].sort();

    expect(deploymentHosts).toEqual(['atmos-clima.netlify.app']);
  });
});
