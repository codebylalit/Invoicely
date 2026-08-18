import { Helmet } from "react-helmet-async";

const DEFAULT_OG_IMAGE = "https://www.getinvoicely.online/invoicelyCover.png";
const SITE_NAME = "Invoicely";

interface SEOHeadProps {
  /** Full page title — shown in browser tab and Google results */
  title: string;
  /** 150–160 character meta description */
  description: string;
  /** Absolute canonical URL for this page */
  canonical: string;
  /** OG image URL — defaults to Invoicely cover image */
  ogImage?: string;
  /** OG type — "website" for landing pages, "article" for blog posts */
  ogType?: "website" | "article";
  /** Optional structured data object(s) — rendered as JSON-LD */
  structuredData?: Record<string, unknown> | Record<string, unknown>[];
  /** Set to true for pages that should not be indexed (e.g. /auth) */
  noindex?: boolean;
  /** Publication date for article type pages (ISO 8601) */
  articlePublishedTime?: string;
  /** Last modified date for article type pages (ISO 8601) */
  articleModifiedTime?: string;
}

/**
 * SEOHead — drop-in component for per-page SEO metadata.
 *
 * Usage:
 *   <SEOHead
 *     title="Free Invoice Generator | Invoicely"
 *     description="Create professional invoices online for free..."
 *     canonical="https://www.getinvoicely.online/free-invoice-generator"
 *   />
 */
const SEOHead = ({
  title,
  description,
  canonical,
  ogImage = DEFAULT_OG_IMAGE,
  ogType = "website",
  structuredData,
  noindex = false,
  articlePublishedTime,
  articleModifiedTime,
}: SEOHeadProps) => {
  const structuredDataArray: Record<string, unknown>[] = structuredData
    ? Array.isArray(structuredData)
      ? structuredData
      : [structuredData]
    : [];

  return (
    <Helmet>
      {/* Core */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonical} />
      {noindex
        ? <meta name="robots" content="noindex, nofollow" />
        : <meta name="robots" content="index, follow" />
      }

      {/* Open Graph */}
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={canonical} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content={SITE_NAME} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={canonical} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {/* Article-specific */}
      {ogType === "article" && articlePublishedTime && (
        <meta property="article:published_time" content={articlePublishedTime} />
      )}
      {ogType === "article" && articleModifiedTime && (
        <meta property="article:modified_time" content={articleModifiedTime} />
      )}

      {/* Structured Data (JSON-LD) */}
      {structuredDataArray.map((data, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(data, null, 0)}
        </script>
      ))}
    </Helmet>
  );
};

export default SEOHead;
