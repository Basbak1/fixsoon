import { useEffect } from 'react';

interface SeoHeadProps {
  title: string;
  description: string;
  canonicalPath?: string;
  noIndex?: boolean;
  jsonLd?: Record<string, unknown>;
}

export function SeoHead({ title, description, canonicalPath, noIndex = false, jsonLd }: SeoHeadProps) {
  useEffect(() => {
    document.title = title;

    const setMeta = (selector: string, attr: string, value: string) => {
      let el = document.querySelector(selector);
      if (!el) {
        el = document.createElement('meta');
        const [key, val] = attr.split('=');
        el.setAttribute(key, val);
        document.head.appendChild(el);
      }
      el.setAttribute('content', value);
    };

    const origin = window.location.origin;
    const href = canonicalPath ? `${origin}${canonicalPath}` : window.location.href;

    setMeta('meta[name="description"]', 'name=description', description);
    setMeta('meta[property="og:title"]', 'property=og:title', title);
    setMeta('meta[property="og:description"]', 'property=og:description', description);
    setMeta('meta[property="og:url"]', 'property=og:url', href);
    setMeta('meta[name="twitter:title"]', 'name=twitter:title', title);
    setMeta('meta[name="twitter:description"]', 'name=twitter:description', description);
    setMeta('meta[name="robots"]', 'name=robots', noIndex ? 'noindex, nofollow' : 'index, follow');

    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', href);

    if (jsonLd) {
      const existingScript = document.getElementById('fixsoon-route-jsonld');
      if (existingScript) existingScript.remove();
      const script = document.createElement('script');
      script.id = 'fixsoon-route-jsonld';
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify(jsonLd);
      document.head.appendChild(script);
    }

    return () => {
      if (jsonLd) {
        const script = document.getElementById('fixsoon-route-jsonld');
        if (script) script.remove();
      }
    };
  }, [title, description, canonicalPath, noIndex, jsonLd]);

  return null;
}
