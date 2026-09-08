'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useOptionalEditMode } from '@/components/cms/edit-mode-provider';
import {
  clearFeatureDemoSessionDismissed,
  shouldShowFeatureDemo,
  writeFeatureDemoDismissed,
} from '@/lib/feature-demo-storage';
import { FeatureDemo } from './feature-demo';

export const START_SITE_TOUR_EVENT = 'editable-website:start-tour';

const ACTIVE_KEY = 'editable-demo:tour:active';
const STEP_KEY = 'editable-demo:tour:step';
const SEEN_ID = 'editable-website-tour-v1';

type TourStepId = 'invite' | 'reveal' | 'hidden-route' | 'login' | 'edit-chip' | 'click-copy' | 'message';

interface TourStep {
  id: TourStepId;
  path: string;
  anchor?: string;
  title: string;
  body: string;
  primaryLabel?: string;
  skipIfAdmin?: boolean;
  revealOwnerSignIn?: boolean;
  enableEditing?: boolean;
  disableEditing?: boolean;
}

const STEPS: TourStep[] = [
  {
    id: 'invite',
    path: '/',
    anchor: '[data-demo="try-demo"]',
    title: 'Want to see how founders edit this?',
    body: 'Visitors get a finished marketing site — not a CMS. This starter is what engineers ship so a founder can change the words themselves. Thirty seconds.',
    primaryLabel: 'Try the demo →',
  },
  {
    id: 'reveal',
    path: '/',
    anchor: '[data-demo="owner-sign-in"]',
    title: 'Ooo — an edit button appeared.',
    body: 'It was never in the main nav. Shoppers browse the lot. Owners get a quiet door that only shows up when you know to look.',
    primaryLabel: 'What is it?',
    skipIfAdmin: true,
    revealOwnerSignIn: true,
  },
  {
    id: 'hidden-route',
    path: '/',
    anchor: '[data-demo="owner-sign-in"]',
    title: 'A hidden route, not a menu item.',
    body: 'Owners sign in at /login. You share that URL with the founder — you do not put it next to Inventory. Dummy login: admin@example.com / edit-demo.',
    primaryLabel: 'Take me there',
    revealOwnerSignIn: true,
  },
  {
    id: 'login',
    path: '/login',
    anchor: '[data-demo="login-card"]',
    title: 'Sign in as the owner.',
    body: 'This is a local cookie, not a hosted identity provider. The demo inbox and password are already filled in. Submit the form and you come back as someone who can edit.',
    primaryLabel: 'Use the form',
    skipIfAdmin: true,
  },
  {
    id: 'edit-chip',
    path: '/',
    anchor: '[data-demo="edit-chip"]',
    title: 'Try this.',
    body: 'The floating pencil is edit mode — not a pencil on every sentence. Click it. Outlines appear on the copy you can change. Visitors never see this chip.',
    primaryLabel: 'Next',
    disableEditing: true,
  },
  {
    id: 'click-copy',
    path: '/',
    anchor: '[data-demo="tour-copy"]',
    title: 'Click the words. Change them.',
    body: 'Try the highlighted line — tap, type, click away. It saves to a local JSON file. No ticket, no redeploy, no “can you move that comma?” email.',
    primaryLabel: 'That’s the idea',
    enableEditing: true,
  },
  {
    id: 'message',
    path: '/',
    title: 'Stop the copy-review loop.',
    body: 'Engineers should not burn sprints swapping headlines. Founders should not wait days to fix a typo. This template lets you ship a marketing site the founder can edit — instead of going back and forth, wasting the customer’s money, burning time, and frustrating everyone.',
    primaryLabel: 'Finish the demo',
  },
];

type DemoTourContextValue = {
  active: boolean;
  step: number;
  revealOwnerSignIn: boolean;
  start: () => void;
  continueFromInvite: () => void;
};

const DemoTourContext = createContext<DemoTourContextValue | null>(null);

export function useDemoTour(): DemoTourContextValue {
  const ctx = useContext(DemoTourContext);
  if (!ctx) throw new Error('useDemoTour must be used within DemoTourProvider');
  return ctx;
}

function persist(active: boolean, step: number) {
  try {
    sessionStorage.setItem(ACTIVE_KEY, active ? '1' : '0');
    sessionStorage.setItem(STEP_KEY, String(step));
  } catch {
    // private mode
  }
}

function clampStep(index: number): number {
  return Math.max(0, Math.min(STEPS.length - 1, index));
}

function stepToward(from: number, dir: 1 | -1, isAdmin: boolean): number {
  let next = from + dir;
  while (next >= 0 && next < STEPS.length && STEPS[next]?.skipIfAdmin && isAdmin) {
    next += dir;
  }
  return clampStep(next);
}

export function DemoTourProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const cms = useOptionalEditMode();
  const cmsRef = useRef(cms);
  cmsRef.current = cms;
  const isAdmin = Boolean(cms?.isAdmin);

  const [mounted, setMounted] = useState(false);
  const [active, setActive] = useState(false);
  const [step, setStep] = useState(0);
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);

  useEffect(() => setMounted(true), []);

  const applyStep = useCallback(
    (index: number, nextActive = true) => {
      const s = clampStep(index);
      setActive(nextActive);
      setStep(s);
      persist(nextActive, s);
      const target = STEPS[s];
      if (nextActive && target && target.path !== window.location.pathname) {
        router.push(target.path);
      }
    },
    [router],
  );

  const start = useCallback(() => {
    clearFeatureDemoSessionDismissed(SEEN_ID);
    cmsRef.current?.setEditing(false);
    applyStep(0);
  }, [applyStep]);

  const startRef = useRef(start);
  startRef.current = start;

  const stop = useCallback(() => {
    setActive(false);
    persist(false, 0);
    setAnchor(null);
  }, []);

  const finish = useCallback(
    (choice: 'completed' | 'skipped') => {
      writeFeatureDemoDismissed(SEEN_ID, choice);
      stop();
    },
    [stop],
  );

  useEffect(() => {
    if (!mounted) return undefined;
    try {
      if (new URLSearchParams(window.location.search).get('featureDemo') === '1') {
        startRef.current();
        return undefined;
      }
      if (sessionStorage.getItem(ACTIVE_KEY) === '1') {
        const stored = clampStep(parseInt(sessionStorage.getItem(STEP_KEY) || '0', 10) || 0);
        setActive(true);
        setStep(stored);
        return undefined;
      }
      if (shouldShowFeatureDemo(SEEN_ID, { enabled: true })) {
        const t = window.setTimeout(() => startRef.current(), 500);
        return () => window.clearTimeout(t);
      }
    } catch {
      // ignore
    }
    return undefined;
  }, [mounted]);

  useEffect(() => {
    const handler = () => start();
    window.addEventListener(START_SITE_TOUR_EVENT, handler);
    return () => window.removeEventListener(START_SITE_TOUR_EVENT, handler);
  }, [start]);

  const current = active ? STEPS[step] : null;
  const revealOwnerSignIn = Boolean(current?.revealOwnerSignIn && !isAdmin);

  useEffect(() => {
    if (!active || !current) return;
    if (current.disableEditing) cmsRef.current?.setEditing(false);
    if (current.enableEditing) cmsRef.current?.setEditing(true);
  }, [active, current?.id]);

  // Keep the walkthrough on the right page, and resume after dummy login.
  useEffect(() => {
    if (!active || !current) return;
    if (current.id === 'login' && pathname === '/' && isAdmin) {
      applyStep(stepToward(step, 1, true));
      return;
    }
    if ((current.id === 'reveal' || current.id === 'hidden-route') && pathname === '/login') {
      applyStep(STEPS.findIndex((item) => item.id === 'login'));
      return;
    }
    if (current.path !== pathname) router.push(current.path);
  }, [active, applyStep, current, isAdmin, pathname, router, step]);

  useEffect(() => {
    if (!active || !current || current.path !== pathname) {
      setAnchor(null);
      return;
    }
    if (!current.anchor) {
      setAnchor(null);
      return;
    }
    let raf = 0;
    let tries = 0;
    let cancelled = false;
    const find = () => {
      if (cancelled) return;
      const el = document.querySelector<HTMLElement>(current.anchor!);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
        setAnchor(el);
      } else if (tries++ < 60) {
        raf = requestAnimationFrame(find);
      } else {
        setAnchor(null);
      }
    };
    const delay = window.setTimeout(find, current.revealOwnerSignIn ? 80 : 0);
    return () => {
      cancelled = true;
      window.clearTimeout(delay);
      cancelAnimationFrame(raf);
    };
  }, [active, current, pathname, revealOwnerSignIn]);

  const go = useCallback(
    (dir: 1 | -1) => {
      const next = stepToward(step, dir, isAdmin);
      if (dir === 1 && next === step && step >= STEPS.length - 1) {
        finish('completed');
        return;
      }
      applyStep(next);
    },
    [applyStep, finish, isAdmin, step],
  );

  const onPrimary = useCallback(() => {
    if (!current) return;
    if (current.id === 'message') {
      finish('completed');
      return;
    }
    if (current.id === 'login') {
      if (isAdmin) {
        go(1);
        return;
      }
      document.getElementById('email')?.focus();
      return;
    }
    if (current.id === 'hidden-route') {
      applyStep(stepToward(step, 1, isAdmin));
      return;
    }
    go(1);
  }, [applyStep, current, finish, go, isAdmin, step]);

  const continueFromInvite = useCallback(() => {
    if (active && STEPS[step]?.id === 'invite') go(1);
    else start();
  }, [active, go, start, step]);

  const value = useMemo<DemoTourContextValue>(
    () => ({ active, step, revealOwnerSignIn, start, continueFromInvite }),
    [active, continueFromInvite, revealOwnerSignIn, start, step],
  );

  const onPath = Boolean(current && current.path === pathname);
  const isLast = step >= STEPS.length - 1;

  return (
    <DemoTourContext.Provider value={value}>
      {children}
      {mounted && active && current && onPath && (
        <FeatureDemo
          open
          anchorEl={anchor}
          stepLabel={`Step ${step + 1} of ${STEPS.length}`}
          title={current.title}
          body={current.body}
          primaryLabel={current.primaryLabel ?? (isLast ? 'Finish' : 'Next')}
          onPrimary={onPrimary}
          secondaryLabel={step > 0 ? 'Back' : 'Not now'}
          onSecondary={step > 0 ? () => go(-1) : () => finish('skipped')}
          tertiaryLabel={step > 0 ? 'Skip tour' : undefined}
          onTertiary={step > 0 ? () => finish('skipped') : undefined}
          onClose={() => finish('skipped')}
        />
      )}
    </DemoTourContext.Provider>
  );
}
