export const HIDDEN_LOGIN_PATH = '/desk-x7k2';
export const DEMO_OWNER_KEY = 'editable-demo:owner';

export function isValidDemoEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function isDemoOwner(): boolean {
  try {
    return sessionStorage.getItem(DEMO_OWNER_KEY) === '1';
  } catch {
    return false;
  }
}

export function setDemoOwner(next: boolean): void {
  try {
    if (next) sessionStorage.setItem(DEMO_OWNER_KEY, '1');
    else sessionStorage.removeItem(DEMO_OWNER_KEY);
  } catch {
    // private mode
  }
}

export function continueWalkthroughAfterLogin(): void {
  try {
    sessionStorage.setItem('ew-walk:active', '1');
    sessionStorage.setItem('ew-walk:step', 'edit-chip');
  } catch {
    // private mode
  }
}
