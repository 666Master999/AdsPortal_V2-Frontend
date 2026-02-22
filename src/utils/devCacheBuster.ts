// devCacheBuster.ts
// Utility for development: forces browser to reload styles/scripts by appending a cache-busting query param

export function cacheBustUrl(url: string): string {
  if (!url) return '';
  const bust = `cb=${Date.now()}`;
  return url.includes('?') ? `${url}&${bust}` : `${url}?${bust}`;
}

// Example usage:
// import { cacheBustUrl } from './devCacheBuster';
// <link :href="cacheBustUrl('/style.css')" ...>
// <script :src="cacheBustUrl('/main.js')" ...>

// For Vue components, you can use this in template bindings for development only.
