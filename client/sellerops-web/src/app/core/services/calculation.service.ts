import { Injectable } from '@angular/core';
import { CalculatorResult, ToolDefinition } from '../models/tool.model';

@Injectable({ providedIn: 'root' })
export class CalculationService {
  calculate(tool: ToolDefinition, values: Record<string, number | string>): CalculatorResult {
    const n = (id: string): number => {
      const value = values[id];
      const number = typeof value === 'number' ? value : Number.parseFloat(String(value));
      return Number.isFinite(number) ? number : 0;
    };
    const s = (id: string): string => String(values[id] ?? '').trim();
    const money = (v: number) => this.money(v);
    const pct = (v: number) => `${this.round(v)}%`;
    const mult = (v: number) => `${this.round(v)}×`;

    switch (tool.slug) {
      case 'profit-margin': {
        const cost = n('cost') + n('shipping') + n('fees'),
          profit = n('sale') - cost;
        return this.result(`Estimated profit: ${money(profit)}`, [
          ['Total variable cost', money(cost)],
          ['Profit margin', pct(this.div(profit, n('sale')) * 100)],
          ['Markup on cost', pct(this.div(profit, cost) * 100)],
        ]);
      }
      case 'markup-price': {
        const cost = n('cost'),
          price = cost * (1 + n('markup') / 100),
          m = n('margin') / 100,
          marginPrice = m < 1 ? cost / (1 - m) : 0;
        return this.result(`Price from markup: ${money(price)}`, [
          ['Price for target margin', money(marginPrice)],
          ['Margin at markup price', pct(this.div(price - cost, price) * 100)],
        ]);
      }
      case 'break-even-price': {
        const total = n('cost') + n('shipping') + n('fees') + n('ads');
        return this.result(
          `Break-even price: ${money(total)}`,
          [
            ['Non-ad costs', money(n('cost') + n('shipping') + n('fees'))],
            ['Expected ad cost', money(n('ads'))],
          ],
          'Add any fixed overhead or seller-borne tax you want included.',
        );
      }
      case 'ecommerce-profit': {
        const rev = n('price') * (1 - n('discount') / 100),
          fees = (rev * n('feeRate')) / 100,
          profit = rev - n('cost') - n('ship') - fees - n('ad');
        return this.result(`Post-ad order profit: ${money(profit)}`, [
          ['Net revenue', money(rev)],
          ['Percentage fees', money(fees)],
          ['Net margin', pct(this.div(profit, rev) * 100)],
        ]);
      }
      case 'discount-sale-price': {
        const price = n('regular') * (1 - n('discount') / 100),
          profit = price - n('cost');
        return this.result(`Sale price: ${money(price)}`, [
          ['Customer saves', money(n('regular') - price)],
          ['Profit after discount', money(profit)],
          ['Remaining margin', pct(this.div(profit, price) * 100)],
        ]);
      }
      case 'bundle-pricing': {
        const price = n('normal') * (1 - n('discount') / 100),
          cost = n('cost') + n('extra'),
          profit = price - cost;
        return this.result(`Bundle price: ${money(price)}`, [
          ['Customer saves', money(n('normal') - price)],
          ['Bundle profit', money(profit)],
          ['Bundle margin', pct(this.div(profit, price) * 100)],
        ]);
      }
      case 'wholesale-pricing': {
        const m = n('wholesaleMargin') / 100,
          wholesale = m < 1 ? n('cost') / (1 - m) : 0;
        return this.result(`Wholesale price: ${money(wholesale)}`, [
          ['Retailer gross profit', money(n('retail') - wholesale)],
          ['Retailer margin', pct(this.div(n('retail') - wholesale, n('retail')) * 100)],
        ]);
      }
      case 'free-shipping-threshold': {
        const suggested = n('aov') * (1 + n('lift') / 100),
          extra = ((suggested - n('aov')) * n('margin')) / 100,
          coverage = this.div(extra, n('ship')) * 100;
        return this.result(
          `Starting threshold: ${money(suggested)}`,
          [
            ['Extra contribution', money(extra)],
            ['Shipping cost coverage', pct(coverage)],
            ['Current AOV', money(n('aov'))],
          ],
          coverage < 100
            ? 'Modeled uplift does not fully cover shipping at the entered margin.'
            : 'Modeled uplift covers the entered average shipping cost.',
        );
      }
      case 'commission-calculator': {
        const commission = (n('revenue') * n('rate')) / 100 + n('fixed');
        return this.result(`Commission: ${money(commission)}`, [
          ['Revenue after commission', money(n('revenue') - commission)],
          ['Effective commission rate', pct(this.div(commission, n('revenue')) * 100)],
        ]);
      }
      case 'sales-tax': {
        const tax = (n('amount') * n('rate')) / 100;
        return this.result(
          `Total with tax: ${money(n('amount') + tax)}`,
          [
            ['Tax amount', money(tax)],
            ['Pre-tax amount', money(n('amount'))],
          ],
          'Arithmetic only; this does not determine taxability or compliance.',
        );
      }
      case 'pod-profit': {
        const fees = (n('price') * n('feeRate')) / 100,
          profit = n('price') - n('base') - n('shipping') - fees - n('ad');
        return this.result(`Estimated POD profit: ${money(profit)}`, [
          ['Platform/payment fees', money(fees)],
          ['Margin', pct(this.div(profit, n('price')) * 100)],
        ]);
      }
      case 'dropshipping-profit': {
        const fees = (n('price') * n('feeRate')) / 100,
          profit =
            n('price') - n('supplier') - n('shipping') - fees - n('refundAllowance') - n('ad');
        return this.result(`Estimated contribution profit: ${money(profit)}`, [
          ['Percentage fees', money(fees)],
          ['Net margin', pct(this.div(profit, n('price')) * 100)],
        ]);
      }
      case 'break-even-roas': {
        const remaining = n('aov') - n('cogs') - n('fulfillment') - n('fees'),
          roas = remaining > 0 ? n('aov') / remaining : 0;
        return this.result(
          remaining > 0 ? `Break-even ROAS: ${mult(roas)}` : 'No positive ad budget available',
          [
            ['Max ad cost/order', money(Math.max(0, remaining))],
            ['Pre-ad contribution', money(remaining)],
          ],
        );
      }
      case 'roas': {
        return this.result(
          `ROAS: ${mult(this.div(n('revenue'), n('spend')))}`,
          [
            ['Revenue', money(n('revenue'))],
            ['Ad spend', money(n('spend'))],
          ],
          'ROAS is a revenue multiple, not a profit metric.',
        );
      }
      case 'cpa': {
        const cpa = this.div(n('spend'), n('orders'));
        return this.result(
          `CPA: ${money(cpa)}`,
          [
            ['Target max CPA', money(n('maxCpa'))],
            ['Headroom', money(n('maxCpa') - cpa)],
          ],
          cpa <= n('maxCpa')
            ? 'CPA is within the entered target.'
            : 'CPA is above the entered target.',
        );
      }
      case 'cpc': {
        const cpc = this.div(n('spend'), n('clicks'));
        return this.result(`Average CPC: ${money(cpc)}`, [
          [
            'Estimated clicks from future budget',
            this.round(this.div(n('budget'), cpc)).toLocaleString(),
          ],
          ['Current clicks', this.round(n('clicks')).toLocaleString()],
        ]);
      }
      case 'conversion-rate': {
        const rate = this.div(n('orders'), n('visits')) * 100,
          target = (n('visits') * n('target')) / 100;
        return this.result(`Conversion rate: ${pct(rate)}`, [
          ['Orders at target rate', this.round(target).toLocaleString()],
          ['Additional orders', this.round(target - n('orders')).toLocaleString()],
        ]);
      }
      case 'aov': {
        const aov = this.div(n('revenue'), n('orders'));
        return this.result(`Current AOV: ${money(aov)}`, [
          ['Target AOV', money(n('target'))],
          ['Revenue at target AOV', money(n('orders') * n('target'))],
        ]);
      }
      case 'customer-ltv': {
        const rev = n('aov') * n('frequency') * n('years'),
          contribution = (rev * n('margin')) / 100;
        return this.result(
          `Contribution LTV: ${money(contribution)}`,
          [
            ['Revenue LTV', money(rev)],
            ['Modeled lifespan', `${this.round(n('years'))} years`],
          ],
          'Simple planning model, not a predictive cohort forecast.',
        );
      }
      case 'ad-profit': {
        const rev = n('orders') * n('aov'),
          pre = (rev * n('margin')) / 100,
          profit = pre - n('spend');
        return this.result(`Post-ad contribution: ${money(profit)}`, [
          ['Attributed revenue', money(rev)],
          ['Pre-ad contribution', money(pre)],
          ['Revenue ROAS', mult(this.div(rev, n('spend')))],
        ]);
      }
      case 'sales-goal': {
        const orders = this.div(n('goal'), n('aov')),
          visits = this.div(orders, n('cvr') / 100),
          days = Math.max(1, n('days'));
        return this.result(
          `Required orders: ${this.round(orders).toLocaleString()}`,
          [
            ['Required visits', this.round(visits).toLocaleString()],
            ['Orders/day', this.round(orders / days).toLocaleString()],
            ['Visits/day', this.round(visits / days).toLocaleString()],
          ],
          'Target model based on your assumptions.',
        );
      }
      case 'email-roi': {
        const contribution = n('revenue') * (1 - n('cogsRate') / 100),
          profit = contribution - n('cost');
        return this.result(`Estimated email ROI: ${pct(this.div(profit, n('cost')) * 100)}`, [
          ['Contribution before email cost', money(contribution)],
          ['Contribution after email cost', money(profit)],
        ]);
      }
      case 'reorder-point': {
        const rp = n('daily') * n('lead') + n('safety');
        return this.result(`Reorder point: ${this.round(rp).toLocaleString()} units`, [
          ['Current stock cover', `${this.round(this.div(n('current'), n('daily')))} days`],
          ['Status', n('current') <= rp ? 'Reorder now' : 'Above reorder point'],
        ]);
      }
      case 'safety-stock': {
        const stock = Math.max(0, n('maxDaily') * n('maxLead') - n('avgDaily') * n('avgLead'));
        return this.result(`Safety stock: ${this.round(stock).toLocaleString()} units`, [
          ['Maximum lead-time demand', this.round(n('maxDaily') * n('maxLead')).toLocaleString()],
          ['Average lead-time demand', this.round(n('avgDaily') * n('avgLead')).toLocaleString()],
        ]);
      }
      case 'inventory-days': {
        return this.result(
          `Estimated stock cover: ${this.round(this.div(n('stock'), n('daily')))} days`,
          [
            ['Current units', this.round(n('stock')).toLocaleString()],
            ['Daily demand', this.round(n('daily')).toLocaleString()],
          ],
        );
      }
      case 'inventory-turnover': {
        const turn = this.div(n('cogs'), n('avgInventory'));
        return this.result(`Inventory turnover: ${this.round(turn)}×`, [
          ['Approx. days inventory', `${this.round(this.div(365, turn))} days`],
          ['Average inventory', money(n('avgInventory'))],
        ]);
      }
      case 'stockout-cost': {
        const units = n('dailyDemand') * n('days') * (1 - n('recover') / 100);
        return this.result(`Estimated lost contribution: ${money(units * n('contribution'))}`, [
          ['Lost units', this.round(units).toLocaleString()],
          ['Recovered/backordered share', pct(n('recover'))],
        ]);
      }
      case 'sku-generator': {
        const clean = (v: string) =>
          v
            .toUpperCase()
            .trim()
            .replace(/[^A-Z0-9]+/g, '-')
            .replace(/^-|-$/g, '');
        const sku = [s('brand'), s('product'), s('variant'), s('seq')]
          .map(clean)
          .filter(Boolean)
          .join('-');
        return this.result(
          sku || 'Enter SKU parts',
          [['Generated SKU', sku || '—']],
          undefined,
          sku,
        );
      }
      case 'order-capacity': {
        const capacity = this.div(
          n('staff') * n('hours') * 60 * (n('utilization') / 100),
          n('minutes'),
        );
        return this.result(
          `Estimated capacity: ${this.round(capacity).toLocaleString()} orders/day`,
          [
            [
              'Productive staff hours',
              this.round((n('staff') * n('hours') * n('utilization')) / 100).toString(),
            ],
            ['Minutes/order', this.round(n('minutes')).toString()],
          ],
        );
      }
      case 'dim-weight': {
        const dim = this.div(n('length') * n('width') * n('height'), n('divisor')),
          bill = Math.max(dim, n('actual'));
        return this.result(
          `Estimated billable weight: ${this.round(bill)} kg`,
          [
            ['Dimensional weight', `${this.round(dim)} kg`],
            ['Actual weight', `${this.round(n('actual'))} kg`],
          ],
          'Carrier rounding and rules may differ.',
        );
      }
      case 'shipping-profit': {
        const contribution = n('productProfit') + n('charged') - n('actual') - n('packaging');
        return this.result(`Post-shipping contribution: ${money(contribution)}`, [
          ['Shipping subsidy', money(Math.max(0, n('actual') + n('packaging') - n('charged')))],
          ['Shipping charged', money(n('charged'))],
        ]);
      }
      case 'cod-return-loss': {
        const failed = (n('orders') * n('rate')) / 100,
          per = n('forward') + n('return') + n('handling');
        return this.result(`Estimated monthly COD loss: ${money(failed * per)}`, [
          ['Failed orders', this.round(failed).toLocaleString()],
          ['Direct loss/failure', money(per)],
        ]);
      }
      case 'return-rate': {
        const rate = this.div(n('returns'), n('orders')) * 100;
        return this.result(`Return rate: ${pct(rate)}`, [
          ['Expected future returns', this.round((n('future') * rate) / 100).toLocaleString()],
          ['Retained order rate', pct(100 - rate)],
        ]);
      }
      case 'refund-loss': {
        const cases = (n('orders') * n('refundRate')) / 100;
        return this.result(`Estimated refund-related loss: ${money(cases * n('nonrecoverable'))}`, [
          ['Estimated cases', this.round(cases).toLocaleString()],
          ['Non-recoverable cost/case', money(n('nonrecoverable'))],
        ]);
      }
      case 'fulfillment-cost': {
        const total = n('pickPack') + n('packaging') + n('storage') + n('carrier') + n('other');
        return this.result(`Fulfillment cost/order: ${money(total)}`, [
          ['Warehouse + packaging', money(n('pickPack') + n('packaging') + n('storage'))],
          ['Carrier + other', money(n('carrier') + n('other'))],
        ]);
      }
      case 'shipping-surcharge': {
        const extra = (n('base') * n('rate')) / 100,
          total = n('base') + extra + n('fixed');
        return this.result(`Total shipping after surcharge: ${money(total)}`, [
          ['Percentage surcharge', money(extra)],
          ['Fixed surcharge', money(n('fixed'))],
        ]);
      }
      case 'marketplace-fee': {
        const fees = (n('sale') * (n('marketRate') + n('paymentRate'))) / 100 + n('fixed'),
          profit = n('sale') - n('cost') - n('fulfillment') - fees;
        return this.result(`Estimated take-home profit: ${money(profit)}`, [
          ['Marketplace + payment fees', money(fees)],
          ['Net margin', pct(this.div(profit, n('sale')) * 100)],
        ]);
      }
      case 'payment-fee': {
        const fee = (n('amount') * n('rate')) / 100 + n('fixed');
        return this.result(`Processing fee: ${money(fee)}`, [
          ['Amount after fee', money(n('amount') - fee)],
          ['Effective fee rate', pct(this.div(fee, n('amount')) * 100)],
        ]);
      }
      case 'utm-builder': {
        const base = s('url');
        let output = base;
        try {
          const url = new URL(base);
          for (const [k, v] of [
            ['utm_source', s('source')],
            ['utm_medium', s('medium')],
            ['utm_campaign', s('campaign')],
            ['utm_content', s('content')],
          ] as const) {
            if (v) url.searchParams.set(k, v);
          }
          output = url.toString();
        } catch {
          output = 'Enter a valid absolute URL such as https://store.test/product';
        }
        return this.result('Campaign URL ready', [['Generated URL', output]], undefined, output);
      }
      case 'slug-generator': {
        const slug = s('text')
          .normalize('NFKD')
          .replace(/[\u0300-\u036f]/g, '')
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '')
          .replace(/-{2,}/g, '-');
        return this.result(slug || 'Enter a title', [['URL slug', slug || '—']], undefined, slug);
      }
      case 'meta-title-checker': {
        const title = s('title'),
          len = title.length,
          status =
            len < 30
              ? 'Very short'
              : len <= 65
                ? 'Practical range'
                : 'Long — may truncate or be rewritten';
        return this.result(`${len} characters`, [
          ['Writing status', status],
          ['Title', title || '—'],
        ]);
      }
      case 'meta-description-checker': {
        const d = s('description'),
          len = d.length,
          status =
            len < 70
              ? 'Very short'
              : len <= 170
                ? 'Practical range'
                : 'Long — snippet may be shortened';
        return this.result(`${len} characters`, [
          ['Writing status', status],
          ['Description', d || '—'],
        ]);
      }
      case 'serp-preview': {
        const title = s('title'),
          d = s('description');
        return this.result(title || 'Search result title', [
          ['URL', s('url') || '—'],
          ['Description', d || '—'],
          ['Title length', `${title.length} chars`],
          ['Description length', `${d.length} chars`],
        ]);
      }
      case 'word-counter': {
        const text = s('text'),
          words = text ? text.split(/\s+/).filter(Boolean).length : 0;
        return this.result(`${words.toLocaleString()} words`, [
          ['Characters', text.length.toLocaleString()],
          ['Characters without spaces', text.replace(/\s/g, '').length.toLocaleString()],
        ]);
      }
      case 'aspect-ratio': {
        const ratio = this.div(n('width'), n('height')),
          targetH = this.div(n('targetWidth'), ratio);
        return this.result(`Aspect ratio: ${this.round(ratio)}:1`, [
          ['Target dimensions', `${Math.round(n('targetWidth'))} × ${Math.round(targetH)} px`],
          ['Current dimensions', `${Math.round(n('width'))} × ${Math.round(n('height'))} px`],
        ]);
      }
      default:
        return this.result('Ready', [], 'This tool uses a specialized interface below.');
    }
  }

  private result(
    headline: string,
    metrics: Array<[string, string]>,
    note?: string,
    primaryCopy?: string,
  ): CalculatorResult {
    return {
      headline,
      metrics: metrics.map(([label, value]) => ({ label, value })),
      note,
      primaryCopy,
    };
  }
  private div(a: number, b: number): number {
    return b === 0 ? 0 : a / b;
  }
  private round(v: number): number {
    return Number.isFinite(v) ? Math.round((v + Number.EPSILON) * 100) / 100 : 0;
  }
  private money(v: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 2,
    }).format(Number.isFinite(v) ? v : 0);
  }
}
