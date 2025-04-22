
export type SubscriptionTier = 'free' | 'pro';

export interface PricingFeature {
  name: string;
  free: boolean;
  pro: boolean;
}

export interface PricingTier {
  name: string;
  price: string;
  description: string;
  features: PricingFeature[];
}
