import { DOCUMENT } from '@angular/common';
import { inject, Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { SITE_CONFIG } from '../site.config';

export interface SeoPayload {
  title: string;
  description: string;
  path: string;
  type?: 'website' | 'article';
  image?: string;
  imageAlt?: string;
  jsonLd?: unknown | unknown[];
  noindex?: boolean;
}

export interface SeoListItem {
  name: string;
  path: string;
}

@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly document = inject(DOCUMENT);

  apply(p: SeoPayload): void {
    const canonical = this.absolute(p.path);
    const image = this.absolute(p.image ?? SITE_CONFIG.defaultOgImage);
    const imageAlt = p.imageAlt ?? `${p.title} — ${SITE_CONFIG.name}`;
    const robots = p.noindex
      ? 'noindex,follow'
      : 'index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1';
    this.title.setTitle(p.title);
    this.meta.updateTag({ name: 'description', content: p.description });
    this.meta.updateTag({ name: 'robots', content: robots });
    this.meta.updateTag({ name: 'googlebot', content: robots });
    this.meta.updateTag({ property: 'og:type', content: p.type ?? 'website' });
    this.meta.updateTag({ property: 'og:locale', content: 'en_US' });
    this.meta.updateTag({ property: 'og:site_name', content: SITE_CONFIG.name });
    this.meta.updateTag({ property: 'og:title', content: p.title });
    this.meta.updateTag({ property: 'og:description', content: p.description });
    this.meta.updateTag({ property: 'og:url', content: canonical });
    this.meta.updateTag({ property: 'og:image', content: image });
    this.meta.updateTag({ property: 'og:image:secure_url', content: image });
    this.meta.updateTag({ property: 'og:image:type', content: 'image/png' });
    this.meta.updateTag({ property: 'og:image:width', content: '1200' });
    this.meta.updateTag({ property: 'og:image:height', content: '630' });
    this.meta.updateTag({ property: 'og:image:alt', content: imageAlt });
    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.meta.updateTag({ name: 'twitter:title', content: p.title });
    this.meta.updateTag({ name: 'twitter:description', content: p.description });
    this.meta.updateTag({ name: 'twitter:image', content: image });
    this.meta.updateTag({ name: 'twitter:image:alt', content: imageAlt });
    this.setCanonical(canonical);
    this.setJsonLd(p.jsonLd);
  }

  websiteSchema(): unknown {
    return {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      '@id': `${this.absolute('/')}#website`,
      name: SITE_CONFIG.name,
      url: this.absolute('/'),
      description: SITE_CONFIG.tagline,
      inLanguage: 'en',
      publisher: { '@id': `${this.absolute('/')}#organization` },
    };
  }
  organizationSchema(): unknown {
    return {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      '@id': `${this.absolute('/')}#organization`,
      name: SITE_CONFIG.name,
      url: this.absolute('/'),
      email: SITE_CONFIG.email,
      telephone: `+${SITE_CONFIG.whatsappNumber}`,
      description: SITE_CONFIG.tagline,
      logo: {
        '@type': 'ImageObject',
        url: this.absolute('/assets/icon-512.svg'),
        width: 512,
        height: 512,
      },
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'customer support',
        telephone: `+${SITE_CONFIG.whatsappNumber}`,
        email: SITE_CONFIG.email,
        url: SITE_CONFIG.whatsappUrl,
        availableLanguage: ['English', 'Bengali'],
      },
    };
  }
  pageSchema(
    name: string,
    description: string,
    path: string,
    type: 'WebPage' | 'CollectionPage' | 'AboutPage' | 'ContactPage' = 'WebPage',
  ): unknown {
    const url = this.absolute(path);
    return {
      '@context': 'https://schema.org',
      '@type': type,
      '@id': `${url}#webpage`,
      url,
      name,
      description,
      inLanguage: 'en',
      isPartOf: { '@id': `${this.absolute('/')}#website` },
      about: { '@id': `${this.absolute('/')}#organization` },
    };
  }
  itemList(items: SeoListItem[], name: string): unknown {
    return {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name,
      numberOfItems: items.length,
      itemListElement: items.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        url: this.absolute(item.path),
      })),
    };
  }
  breadcrumbs(items: SeoListItem[]): unknown {
    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      '@id': `${this.absolute(items.at(-1)?.path ?? '/')}#breadcrumb`,
      itemListElement: items.map((x, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: x.name,
        item: this.absolute(x.path),
      })),
    };
  }
  absolute(path: string): string {
    if (/^https?:\/\//i.test(path)) return path;
    return `${SITE_CONFIG.siteUrl.replace(/\/$/, '')}${path.startsWith('/') ? path : `/${path}`}`;
  }
  private setCanonical(href: string): void {
    let link = this.document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = this.document.createElement('link');
      link.rel = 'canonical';
      this.document.head.appendChild(link);
    }
    link.href = href;
  }
  private setJsonLd(value?: unknown | unknown[]): void {
    this.document.head
      .querySelectorAll('script[data-sellerops-jsonld="true"]')
      .forEach((n) => n.remove());
    if (!value) return;
    for (const item of Array.isArray(value) ? value : [value]) {
      const script = this.document.createElement('script');
      script.type = 'application/ld+json';
      script.setAttribute('data-sellerops-jsonld', 'true');
      script.textContent = JSON.stringify(item).replace(/</g, '\\u003c');
      this.document.head.appendChild(script);
    }
  }
}
