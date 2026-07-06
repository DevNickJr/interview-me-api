export type PlanType = 'free' | 'basic' | 'pro';

export interface PlanConfig {
  name: string;
  sessionsPerMonth: number;
  retriesPerSession: number;
  premiumVoices: boolean;
  premiumArchetypes: boolean;
  price: number;
}

export const PLANS: Record<PlanType, PlanConfig> = {
  free: {
    name: 'Free',
    sessionsPerMonth: 3,
    retriesPerSession: 2,
    premiumVoices: false,
    premiumArchetypes: false,
    price: 0,
  },
  basic: {
    name: 'Basic',
    sessionsPerMonth: 25,
    retriesPerSession: 10,
    premiumVoices: true,
    premiumArchetypes: true,
    price: 299,
  },
  pro: {
    name: 'Pro',
    sessionsPerMonth: -1,
    retriesPerSession: -1,
    premiumVoices: true,
    premiumArchetypes: true,
    price: 999,
  },
} as const;

export const SERVICE_CREDITS: Record<string, number> = {
  session: 1,
  retry: 0,
};
