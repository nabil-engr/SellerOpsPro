import { GuideDefinition } from '../models/guide.model';

export const GUIDES: GuideDefinition[] = [
  {
    slug: 'profit-margin-vs-markup',
    title: 'Profit Margin vs Markup: The Seller-Friendly Difference',
    description:
      'Understand margin and markup with ecommerce examples so pricing decisions do not accidentally destroy profit.',
    category: 'profit-pricing',
    sections: [
      {
        heading: 'Why sellers confuse the two',
        paragraphs: [
          'Margin and markup both describe profit, but they answer different questions. Margin asks what percentage of selling price remains after included costs. Markup asks how much profit was added relative to cost.',
          'Because they use different bases, a 50% markup does not produce a 50% margin.',
        ],
      },
      {
        heading: 'A simple example',
        paragraphs: [
          'If a product costs $25 and sells for $50, profit is $25. Markup is 100%; margin is 50%.',
          'This matters when a seller says they need a 40% margin but simply adds 40% to cost.',
        ],
      },
      {
        heading: 'Which number to use',
        paragraphs: [
          'Use markup for quick cost-based price setting. Use margin for product profitability, discount room and ad economics.',
        ],
      },
      {
        heading: 'Build a reliable cost base',
        paragraphs: [
          'Start with landed product cost, packaging, seller-paid delivery, payment fees and other variable costs. Leaving one of these out makes both markup and margin look healthier than they really are.',
          'Recheck the calculation before promotions because a discount reduces selling price while most unit costs remain unchanged.',
        ],
      },
      {
        heading: 'A practical pricing check',
        paragraphs: [
          'Record the current cost, normal selling price, planned sale price, margin and markup in one sheet. That makes it easier to compare products and spot items that cannot safely absorb a discount or higher ad cost.',
        ],
      },
    ],
    related: ['profit-margin', 'markup-price', 'discount-sale-price'],
  },
  {
    slug: 'break-even-roas-guide',
    title: 'How to Calculate Break-even ROAS Before Scaling Ads',
    description:
      'Learn how product economics determine the ROAS you need before a paid campaign contributes profit.',
    category: 'ads-growth',
    sections: [
      {
        heading: 'ROAS alone is incomplete',
        paragraphs: [
          'A positive ROAS can still lose money because revenue must first cover product, fulfillment, transaction and other variable costs.',
        ],
      },
      {
        heading: 'Find max acquisition cost',
        paragraphs: [
          'Start with AOV and subtract non-ad variable costs. The remaining amount is the maximum ad cost at zero contribution profit.',
          'Divide AOV by that maximum ad cost to estimate break-even ROAS.',
        ],
      },
      {
        heading: 'Use scenarios',
        paragraphs: [
          'AOV, product mix and return behavior change. Use conservative and optimistic cases instead of one permanent number.',
        ],
      },
      {
        heading: 'Break-even is not the target',
        paragraphs: [
          'Break-even ROAS only marks the point where contribution profit reaches zero. A campaign that operates exactly at that number does not create room for overhead, payroll, growth investment or unexpected returns.',
          'Set a target ROAS above break-even based on the contribution profit you want from each order.',
        ],
      },
      {
        heading: 'Inputs to revisit',
        paragraphs: [
          'Recalculate when average order value, product mix, discounting, fulfillment cost, payment fees or return rate changes. Compare platform-reported revenue with actual completed orders so cancelled and refunded sales do not inflate the result.',
        ],
      },
    ],
    related: ['break-even-roas', 'roas', 'ad-profit', 'cpa'],
  },
  {
    slug: 'reorder-point-guide',
    title: 'Reorder Point Explained for Small Ecommerce Inventory',
    description:
      'Use daily demand, supplier lead time and safety stock to know when to place the next inventory order.',
    category: 'inventory-ops',
    sections: [
      {
        heading: 'Why zero is too late',
        paragraphs: [
          'Reordering at zero ignores supplier lead time. You need stock to cover expected demand while replenishment travels.',
        ],
      },
      {
        heading: 'Basic formula',
        paragraphs: [
          'Multiply average daily demand by lead time, then add safety stock. For 12 units/day, 10 lead days and 40 safety units, reorder point is 160.',
        ],
      },
      {
        heading: 'When simple models break',
        paragraphs: [
          'Seasonality, viral campaigns and unstable suppliers need more active forecasting and updated assumptions.',
        ],
      },
      {
        heading: 'Track lead-time variability',
        paragraphs: [
          'Average lead time can hide late deliveries. Record both typical and slow supplier lead times, then use safety stock to protect against the delay range your business can realistically experience.',
          'A fast-moving product with an unreliable supplier usually needs a different buffer from a stable product sourced locally.',
        ],
      },
      {
        heading: 'Review the trigger regularly',
        paragraphs: [
          'Review reorder points after promotions, seasonal demand changes and supplier performance shifts. A monthly review may suit steady products, while campaign-driven products need a check before each major launch.',
        ],
      },
    ],
    related: ['reorder-point', 'safety-stock', 'inventory-days'],
  },
  {
    slug: 'cod-return-cost-guide',
    title: 'The Hidden Cost of Failed COD Orders',
    description:
      'See why cash-on-delivery failures quietly consume margin through forward shipping, return shipping and handling.',
    category: 'shipping-returns',
    sections: [
      {
        heading: 'Why failed COD is expensive',
        paragraphs: [
          'The product may return to inventory, but logistics and handling costs often remain.',
        ],
      },
      {
        heading: 'Convert failure into money',
        paragraphs: [
          'Multiply COD orders by failure rate, then multiply failed orders by the non-recoverable cost per failed delivery.',
        ],
      },
      {
        heading: 'Reduce avoidable failures',
        paragraphs: [
          'Confirmation, address checks, prepaid incentives and better courier processes can be tested.',
        ],
      },
      {
        heading: 'Separate recoverable and lost value',
        paragraphs: [
          'Returned inventory may still be sellable, but forward delivery, return delivery, packaging damage, call-center time and restocking work can remain lost. Track these components separately instead of treating every returned order as a full product loss.',
        ],
      },
      {
        heading: 'Measure each intervention',
        paragraphs: [
          'Compare failure rate and cost per confirmed order before and after address verification, confirmation calls or prepaid incentives. Keep changes that reduce total loss, not only the visible return count.',
        ],
      },
    ],
    related: ['cod-return-loss', 'return-rate', 'refund-loss'],
  },
  {
    slug: 'dimensional-weight-guide',
    title: 'Dimensional Weight: Why a Light Box Can Cost More to Ship',
    description:
      'Understand dimensional weight, billable weight and why packaging size can change shipping cost.',
    category: 'shipping-returns',
    sections: [
      {
        heading: 'Carriers sell space too',
        paragraphs: [
          'Large lightweight packages consume vehicle space, so many carriers convert volume into a theoretical weight.',
        ],
      },
      {
        heading: 'Billable weight',
        paragraphs: [
          'Many services charge the higher of actual and dimensional weight. Smaller packaging can reduce cost even when product weight is unchanged.',
        ],
      },
      {
        heading: 'Measure the packed parcel',
        paragraphs: [
          'Use the outside length, width and height of the parcel after packing. Product dimensions alone miss empty space, protective material and the final shipping box.',
          'Round measurements using the carrier rule that applies to the service because small differences can move a parcel into a higher billable band.',
        ],
      },
      {
        heading: 'Compare services before redesigning packaging',
        paragraphs: [
          'Carriers and service levels can use different dimensional divisors and minimum charges. Calculate the same packed parcel under each relevant rule before deciding whether a smaller box or another service produces a real saving.',
        ],
      },
    ],
    related: ['dim-weight', 'shipping-profit', 'fulfillment-cost'],
  },
  {
    slug: 'free-shipping-threshold-guide',
    title: 'How to Set a Free Shipping Threshold Without Guessing',
    description:
      'Use AOV, contribution margin and shipping cost to create a free-shipping threshold that supports larger baskets.',
    category: 'profit-pricing',
    sections: [
      {
        heading: 'Start from current AOV',
        paragraphs: [
          'A threshold below normal AOV gives away shipping without changing behavior; one far above AOV may feel unreachable.',
        ],
      },
      {
        heading: 'Protect contribution',
        paragraphs: [
          'Check whether the extra contribution created above AOV can absorb average shipping cost, then test conversion and basket size together.',
        ],
      },
      {
        heading: 'Run a controlled threshold test',
        paragraphs: [
          'Choose a threshold slightly above current average order value, then monitor conversion rate, average order value, shipping subsidy and contribution profit together. A larger basket is useful only when the additional margin covers the shipping cost.',
        ],
      },
      {
        heading: 'Watch customer and product segments',
        paragraphs: [
          'Heavy products, remote delivery zones and low-margin categories may need exclusions or a different threshold. Document those rules clearly so customers understand when free shipping applies.',
        ],
      },
    ],
    related: ['free-shipping-threshold', 'aov', 'profit-margin'],
  },
  {
    slug: 'utm-tracking-guide',
    title: 'A Simple UTM Naming System for Ecommerce Campaigns',
    description:
      'Create consistent source, medium, campaign and content values so analytics reports stay readable.',
    category: 'store-seo',
    sections: [
      {
        heading: 'Consistency wins',
        paragraphs: [
          'facebook, Facebook and fb can fragment analytics reports even when they mean the same source.',
        ],
      },
      {
        heading: 'Practical structure',
        paragraphs: [
          'Use source for platform, medium for channel type, campaign for initiative and content for creative variant.',
        ],
      },
      {
        heading: 'Canonical URLs',
        paragraphs: [
          'Tracking parameters can create URL variants, so landing pages should point search engines to a clean canonical URL.',
        ],
      },
      {
        heading: 'Document one naming standard',
        paragraphs: [
          'Keep a short shared reference for approved source, medium and campaign values. Lowercase values and a consistent separator reduce accidental duplicates in analytics reports.',
          'Use content values for meaningful creative or placement variants, not random labels that nobody can interpret later.',
        ],
      },
      {
        heading: 'Protect clean data',
        paragraphs: [
          'Do not place names, email addresses or other personal data in UTM parameters because campaign URLs can appear in browser history, analytics systems and shared messages. Test every generated link before launch and preserve the clean landing-page canonical.',
        ],
      },
    ],
    related: ['utm-builder', 'serp-preview', 'website-audit'],
  },
  {
    slug: 'ecommerce-seo-basics',
    title: 'Technical SEO Basics for a Small Ecommerce Store',
    description:
      'A practical checklist covering crawlability, titles, descriptions, canonical URLs, mobile viewport and internal links.',
    category: 'store-seo',
    sections: [
      {
        heading: 'Make pages discoverable',
        paragraphs: [
          'Important pages should have crawlable links and stable URLs; a sitemap supports discovery but does not replace navigation.',
        ],
      },
      {
        heading: 'Control duplicates',
        paragraphs: [
          'Tracking parameters and filters can create similar URLs. Pick a preferred canonical and keep sitemap URLs consistent.',
        ],
      },
      {
        heading: 'Write page-specific metadata',
        paragraphs: [
          'Titles and descriptions should accurately describe each page rather than repeat one template everywhere.',
        ],
      },
      {
        heading: 'Prioritize indexable pages',
        paragraphs: [
          'Index pages that provide a distinct product, category, guide or service experience. Thin filter combinations, internal search results and duplicate tracking URLs should not compete with the preferred page.',
          'Make sure each important page returns a successful status, has one descriptive main heading and appears in both internal navigation and the XML sitemap.',
        ],
      },
      {
        heading: 'Measure with Search Console',
        paragraphs: [
          'After launch, submit the sitemap and inspect a sample of important URLs. Review indexing reports, search queries, click-through rate and page experience, then improve pages that receive impressions but do not satisfy the search intent.',
        ],
      },
    ],
    related: ['website-audit', 'meta-title-checker', 'meta-description-checker', 'slug-generator'],
  },
  {
    slug: 'product-image-performance',
    title: 'Product Image Performance Without Ruining Visual Quality',
    description:
      'Reduce image weight, preserve useful dimensions and build a consistent ecommerce media workflow.',
    category: 'store-seo',
    sections: [
      {
        heading: 'Start with dimensions',
        paragraphs: [
          'Do not upload camera-original dimensions when the storefront only needs a much smaller display size.',
        ],
      },
      {
        heading: 'Choose format and quality',
        paragraphs: [
          'WebP can provide strong compression. Test quality against real product details rather than using one number blindly.',
        ],
      },
      {
        heading: 'Keep layout stable',
        paragraphs: ['Consistent aspect ratios and explicit dimensions help avoid layout shifts.'],
      },
      {
        heading: 'Deliver the right image size',
        paragraphs: [
          'Responsive image candidates let a phone download a smaller file than a desktop display. Load the main product image promptly, but lazy-load images below the first screen without requiring a click or scroll event to reveal their URLs to crawlers.',
        ],
      },
      {
        heading: 'Use a repeatable export workflow',
        paragraphs: [
          'Keep an original master, export the largest storefront size actually needed, compress it, and compare detail at normal viewing size. Record the chosen dimensions and quality range so new catalog images remain visually consistent.',
        ],
      },
    ],
    related: ['image-compressor', 'aspect-ratio', 'website-audit'],
  },
  {
    slug: 'marketplace-fee-profit',
    title: 'How Marketplace Fees Change Real Product Profit',
    description:
      'Model commission, payment fees, fulfillment and fixed charges before deciding whether a marketplace price is profitable.',
    category: 'store-seo',
    sections: [
      {
        heading: 'Gross sales are not take-home',
        paragraphs: [
          'Marketplace fees can include commission, payment processing, fulfillment and fixed charges.',
        ],
      },
      {
        heading: 'Compare channels by contribution',
        paragraphs: [
          'A marketplace may convert better but charge more fees; your own store may have lower platform fees but higher acquisition cost. Compare contribution profit.',
        ],
      },
      {
        heading: 'Build the complete fee stack',
        paragraphs: [
          'List percentage commission, payment processing, fulfillment, storage, fixed order charges, promotional deductions and seller-funded delivery. Apply each fee to the correct base because some percentages use item price while others use the total customer payment.',
        ],
      },
      {
        heading: 'Test sensitivity before changing price',
        paragraphs: [
          'Model normal, discounted and high-return scenarios. A small fee or return-rate change can remove the remaining profit from a low-margin product, so review the calculation whenever marketplace terms or fulfillment methods change.',
        ],
      },
    ],
    related: ['marketplace-fee', 'payment-fee', 'ecommerce-profit'],
  },
];
export const GUIDE_SLUGS = GUIDES.map((guide) => guide.slug);
export const GUIDE_MAP = new Map(GUIDES.map((guide) => [guide.slug, guide] as const));
