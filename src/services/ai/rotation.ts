// import console from "@/shared/utils/console";


export const PROVIDERS = ["openai", "anthropic", "groq", "gemini"] as const;
export type Provider = (typeof PROVIDERS)[number];

export const TIERS: {
  name: string;
  models: Record<Provider, string>;
}[] = [
  {
    name: "Tier 1 (High Quality / Primary)",
    models: {
      groq: "llama-3.3-70b-versatile",
      gemini: "gemini-2.5-pro",
      openai: "gpt-4o", 
      anthropic: 'claude-sonnet-4-5-20250929'
    }
  },
  {
    name: "Tier 2 (Medium Quality / High Volume Backup)",
    models: {
      groq: "openai/gpt-oss-20b",
      gemini: "gemini-2.5-flash",
      openai: "gpt-4o-mini",
      anthropic: 'claude-sonnet-4-5-20250929'
    }
  },
  {
    name: "Tier 3 (Ultimate Backup / High Limits)",
    models: {
      groq: "llama-3.1-8b-instant",
      gemini: "gemini-2.5-flash-lite",
      openai: "gpt-4o-mini" ,
      anthropic: 'claude-sonnet-4-5-20250929'
    }
  }
] as const;

let currentTierIndex = 0;
let currentProviderIndex = 0;
// Track the last time a failure forced us away from Tier 0
let lastFailureTime: number = 0;
const RESET_COOL_DOWN_MS = 60 * 60 * 1000; // 60 mins

function checkAndApplyLazyReset() {
  if (currentTierIndex > 0) {
    const timeSinceLastFailure = Date.now() - lastFailureTime;
    
    if (timeSinceLastFailure >= RESET_COOL_DOWN_MS) {
      console.log(`[Rotation] Cool-down expired. Healing system back to Tier 1.`);
      currentTierIndex = 0;
      currentProviderIndex = 0; 
    }
  }
}

export function getCurrentProvider() {
  checkAndApplyLazyReset();
  return PROVIDERS[currentProviderIndex];
}

export function getCurrentModel(): string {
  const provider = PROVIDERS[currentProviderIndex];
  return TIERS[currentTierIndex].models[provider];
}

export function recordSuccess() {
  console.info(`Content Generation in progress ${getCurrentProvider()} - ${getCurrentModel()}`)
}

export function recordFailure() {
  const failedProvider = PROVIDERS[currentProviderIndex];
  const failedModel = getCurrentModel();

  // Update the failure timestamp whenever we encounter an issue
  lastFailureTime = Date.now();

  // 1. Move to the next provider within the same quality tier
  if (currentProviderIndex < PROVIDERS.length - 1) {
    currentProviderIndex++;
    console.warn(
      `[Rotation] ${failedProvider} (${failedModel}) failed. Moving to next provider in same tier (${currentTierIndex}): ${PROVIDERS[currentProviderIndex]} (${getCurrentModel()})`
    );
  } else {
    // 2. All providers in this tier failed. Reset provider and drop down a tier!
    currentProviderIndex = 0;
    
    if (currentTierIndex < TIERS.length - 1) {
      currentTierIndex++;
      console.warn(
        `[Rotation] All providers in ${TIERS[currentTierIndex - 1].name} exhausted. Dropping to ${TIERS[currentTierIndex].name} -> starting with: ${PROVIDERS[currentProviderIndex]} (${getCurrentModel()})`
      );
    } else {
      // 3. Complete system exhaustion. Wrap everything back to the beginning.
      currentTierIndex = 0;
      console.error("[Rotation] CRITICAL: Every single model and tier has been exhausted. Wrapping back to Tier 1.");
    }
  }
}

export function getTotalAvailableConfigurations(): number {
  return TIERS.length * PROVIDERS.length;
}