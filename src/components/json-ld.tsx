import staticData from "@/lib/data.json";

/**
 * JSON-LD structured data for the homepage.
 * Renders Person + WebSite schemas for Google rich results / knowledge panel.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function HomeJsonLd({ siteConfig: siteConfigProp, socialLinks: socialLinksProp }: { siteConfig?: any; socialLinks?: any[] } = {}) {
  const config = siteConfigProp || staticData.siteConfig;
  const socials = socialLinksProp || staticData.socialLinks || [];

  const personSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: config.name,
    url: config.url,
    image: `${config.url}${config.profileImage}`,
    jobTitle: config.title,
    email: config.email,
    sameAs: socials
      .filter((s) => s.url && !s.url.startsWith("mailto:"))
      .map((s) => s.url),
    alumniOf: [
      {
        "@type": "CollegeOrUniversity",
        name: "University of the West of Scotland",
        url: "https://www.uws.ac.uk/",
      },
      {
        "@type": "CollegeOrUniversity",
        name: "Asian College of Higher Studies",
        url: "https://achsnepal.edu.np/",
      },
    ],
    knowsAbout: [
      "Network Engineering",
      "ISP Infrastructure",
      "Cisco Networking",
      "MikroTik",
      "Zero Trust Security",
      "IPTV",
      "Network Monitoring",
      "LAN/WAN",
      "Cybersecurity",
    ],
    address: {
      "@type": "PostalAddress",
      addressRegion: "Scotland",
      addressCountry: "GB",
    },
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: config.name,
    url: config.url,
    description: config.description,
    author: {
      "@type": "Person",
      name: config.name,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(personSchema).replace(/<\/script>/gi, "<\\/script>"),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(websiteSchema).replace(/<\/script>/gi, "<\\/script>"),
        }}
      />
    </>
  );
}

/**
 * JSON-LD structured data for individual blog posts.
 * Renders BlogPosting schema for Google article rich results.
 */
export function BlogPostJsonLd({
  title,
  description,
  datePublished,
  slug,
  siteConfig: siteConfigProp,
}: {
  title: string;
  description: string;
  datePublished: string;
  slug: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  siteConfig?: any;
}) {
  const config = siteConfigProp || staticData.siteConfig;

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: title,
    description: description,
    datePublished: datePublished,
    dateModified: datePublished,
    url: `${config.url}/blog/${slug}`,
    author: {
      "@type": "Person",
      name: config.name,
      url: config.url,
    },
    publisher: {
      "@type": "Person",
      name: config.name,
      url: config.url,
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${config.url}/blog/${slug}`,
    },
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: config.url,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Blog",
        item: `${config.url}/blog`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: title,
        item: `${config.url}/blog/${slug}`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleSchema).replace(/<\/script>/gi, "<\\/script>"),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema).replace(/<\/script>/gi, "<\\/script>"),
        }}
      />
    </>
  );
}

/**
 * JSON-LD structured data for Breadcrumbs across section pages.
 */
export function BreadcrumbJsonLd({
  items,
}: {
  items: { name: string; url: string }[];
}) {
  const baseUrl = staticData.siteConfig.url || "https://rajanchand.com.np";
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: item.name,
      item: item.url.startsWith("http") ? item.url : `${baseUrl}${item.url}`,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(breadcrumbSchema).replace(/<\/script>/gi, "<\\/script>"),
      }}
    />
  );
}

