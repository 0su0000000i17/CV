import type { MetadataRoute } from 'next';

const siteUrl = 'https://cvpro.example';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/admin',
        '/admin/',
        '/admin/*',
        '/dashboard',
        '/dashboard/',
        '/dashboard/*',
        '/login',
        '/privacy',
        '/terms',
        '/offer',
        '/personal-data',
      ],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
