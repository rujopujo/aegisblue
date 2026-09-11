/**
 * AegisBlue Enterprise Demo Wallet & Treasury Service
 * Provides persistent simulated USD liquidity ($1,000,000.00 USD) and
 * allocated MGROV carbon credit balances for testing marketplace purchases,
 * direct ERC-1155 peer-to-peer transfers, and permanent on-chain retirements.
 */

const STORAGE_KEY = 'aegisblue_wallet_treasury_v2';
const EVENT_NAME = 'aegisblue:wallet-updated';

export interface DemoWalletState {
  usdTreasury: number;
  creditsByProject: Record<string, number>;
}

const DEFAULT_STATE: DemoWalletState = {
  usdTreasury: 1000000.0, // $1,000,000.00 USD
  creditsByProject: {
    // Default balances allocated to user's connected wallet (totaling ~$1,000,000 in carbon assets)
    'AEGIS-SUNDARBANSDELTA-1863': 10000,
    'PROJ-SUN-2026-01': 10000,
    'AEGIS-PICHAVARAMESTUAR-180': 6000,
    'PROJ-BHI-2026-03': 5903,
  },
};

/**
 * Loads the current demo wallet state from localStorage with fallback to $1,000,000 USD
 */
export function getDemoWalletState(): DemoWalletState {
  if (typeof window === 'undefined') return DEFAULT_STATE;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (typeof parsed?.usdTreasury === 'number') {
        return {
          usdTreasury: parsed.usdTreasury,
          creditsByProject: parsed.creditsByProject || {},
        };
      }
    }
  } catch (err) {
    console.warn('[AegisBlue] Could not parse demo wallet state:', err);
  }

  saveDemoWalletState(DEFAULT_STATE);
  return DEFAULT_STATE;
}

/**
 * Saves demo wallet state and broadcasts event across components
 */
export function saveDemoWalletState(state: DemoWalletState): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: state }));
  } catch (err) {
    console.error('[AegisBlue] Failed to save demo wallet state:', err);
  }
}

/**
 * Subscribes a React component to live updates of the demo wallet state
 */
export function subscribeDemoWallet(listener: (state: DemoWalletState) => void): () => void {
  if (typeof window === 'undefined') return () => {};

  const handler = (e: Event) => {
    const custom = e as CustomEvent<DemoWalletState>;
    listener(custom.detail || getDemoWalletState());
  };

  window.addEventListener(EVENT_NAME, handler);
  return () => {
    window.removeEventListener(EVENT_NAME, handler);
  };
}

/**
 * Gets the user's MGROV credit balance for a given project ID.
 * Automatically seeds 10,000 credits if uninitialized.
 */
export function getProjectDemoCredits(projectId: string): number {
  const state = getDemoWalletState();
  if (state.creditsByProject[projectId] !== undefined) {
    return state.creditsByProject[projectId];
  }

  // Seed default 10,000 MGROV tokens for this project
  const updatedCredits = {
    ...state.creditsByProject,
    [projectId]: 10000,
  };
  saveDemoWalletState({
    ...state,
    creditsByProject: updatedCredits,
  });
  return 10000;
}

/**
 * Executes a simulated direct transfer of credits
 */
export function executeDemoTransfer(
  projectId: string,
  amount: number
): { success: boolean; remaining: number; txHash: string } {
  const state = getDemoWalletState();
  const current = getProjectDemoCredits(projectId);

  if (amount > current) {
    throw new Error(`Insufficient demo balance: you hold ${current} credits, tried to transfer ${amount}.`);
  }

  const remaining = current - amount;
  const updatedCredits = {
    ...state.creditsByProject,
    [projectId]: remaining,
  };

  saveDemoWalletState({
    ...state,
    creditsByProject: updatedCredits,
  });

  const randHex = (bytes: number) =>
    Array.from({ length: bytes * 2 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
  const txHash = `0x${randHex(32)}`;

  return { success: true, remaining, txHash };
}

/**
 * Executes a simulated retirement / burn of credits
 */
export function executeDemoRetirement(
  projectId: string,
  amount: number
): { success: boolean; remaining: number; txHash: string } {
  const state = getDemoWalletState();
  const current = getProjectDemoCredits(projectId);

  const remaining = Math.max(0, current - amount);
  const updatedCredits = {
    ...state.creditsByProject,
    [projectId]: remaining,
  };

  saveDemoWalletState({
    ...state,
    creditsByProject: updatedCredits,
  });

  const randHex = (bytes: number) =>
    Array.from({ length: bytes * 2 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
  const txHash = `0x${randHex(32)}`;

  return { success: true, remaining, txHash };
}

/**
 * Adds USD liquidity to the Enterprise Treasury
 */
export function topUpUsdTreasury(amount: number = 1000000): number {
  const state = getDemoWalletState();
  const newBalance = state.usdTreasury + amount;
  saveDemoWalletState({
    ...state,
    usdTreasury: newBalance,
  });
  return newBalance;
}

/**
 * Mints additional demo MGROV carbon credits to the user's wallet
 */
export function mintDemoCredits(projectId: string, amount: number = 10000): number {
  const state = getDemoWalletState();
  const current = getProjectDemoCredits(projectId);
  const newBalance = current + amount;

  saveDemoWalletState({
    ...state,
    creditsByProject: {
      ...state.creditsByProject,
      [projectId]: newBalance,
    },
  });
  return newBalance;
}

/**
 * Resets the demo wallet to the fresh $1,000,000 USD default state
 */
export function resetDemoWallet(): DemoWalletState {
  saveDemoWalletState(DEFAULT_STATE);
  return DEFAULT_STATE;
}
