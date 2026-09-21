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
import gsap from 'gsap';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import { setEditing } from 'editable-website';
import {
  clearFeatureDemoSessionDismissed,
  shouldShowFeatureDemo,
  writeFeatureDemoDismissed,
} from '@/lib/feature-demo-storage';
import { DEMO_OWNER_EVENT, isDemoOwner, setDemoOwner } from '@/lib/demo-owner';
import { HIDDEN_LOGIN_PATH } from '@/lib/hidden-login-path';
import { clearTourPopPosition, FeatureDemo } from './feature-demo';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollToPlugin);
}

export const START_SITE_TOUR_EVENT = 'editable-website:start-tour';

const ACTIVE_KEY = 'editable-demo:tour:active';
const STEP_KEY = 'editable-demo:tour:step';
const VISITOR_KEY = 'editable-demo:tour:visitor';
const SEEN_ID = 'editable-website-tour-v6';

type TourStepId = 'intro' | 'invite' | 'sign-in' | 'edit-chip' | 'click-copy' | 'inventory' | 'implement';

interface TourStep {
  id: TourStepId;
  path: string;
  anchor?: string;
  title: string;
  body: string;
  afterBody?: ReactNode;
  primaryLabel?: string;
  primaryHref?: string;
  skipIfAdmin?: boolean;
  enableEditing?: boolean;
  disableEditing?: boolean;
  scroll?: ScrollLogicalPosition;
}

const IMPLEMENT_AFTER = (
  <div className="mt-3 space-y-3 text-sm leading-relaxed text-zinc-400">
    <p>
      If you’re a developer, install{' '}
      <a
        href="https://www.npmjs.com/package/editable-website"
        target="_blank"
        rel="noreferrer"
        className="text-amber-200 underline-offset-2 hover:text-white hover:underline"
      >
        editable-website
      </a>{' '}
      from npm and integrate it into your marketing website.
    </p>
    <p>
      If you’re a business owner, write{' '}
      <a href="mailto:adam@freeech.co" className="text-amber-200 underline-offset-2 hover:text-white hover:underline">
        adam@freeech.co
      </a>{' '}
      — we’ll implement this on your site for as little as $500.
    </p>
  </div>
);

const STEPS: TourStep[] = [
  {
    id: 'intro',
    path: '/',
    title: 'See it work in a minute.',
    body: 'This is a finished marketing page — not a CMS dashboard. Start the demo and we’ll walk you through signing in and editing copy on the page.',
    primaryLabel: 'Start demo',
  },
  {
    id: 'invite',
    path: '/',
    title: 'Owners use a hidden page.',
    body: `This looks like a finished marketing site — not a CMS. Login is not in the nav. Owners bookmark a random URL (${HIDDEN_LOGIN_PATH}).`,
    primaryLabel: 'Open hidden login',
    primaryHref: HIDDEN_LOGIN_PATH,
    skipIfAdmin: true,
  },
  {
    id: 'sign-in',
    path: HIDDEN_LOGIN_PATH,
    anchor: '[data-demo="login-card"]',
    title: 'Access hidden login',
    body: 'This page is not linked from the lot. Any valid email and password works. This demo does not create a real session. Fill the form, then tap Sign in — you go back to the lot as someone who can edit.',
    primaryLabel: 'Sign in',
    skipIfAdmin: true,
    scroll: 'center',
  },
  {
    id: 'edit-chip',
    path: '/',
    anchor: '[data-demo="edit-chip"]',
    title: 'Click Edit the site.',
    body: 'The chip in the corner. Outlines appear on copy you can change. Visitors never see this.',
    primaryLabel: 'Next',
    disableEditing: true,
    scroll: 'nearest',
  },
  {
    id: 'click-copy',
    path: '/',
    anchor: '[data-demo="tour-copy"]',
    title: 'Click the words. Change them.',
    body: 'Try the highlighted line — tap, type, click away. This demo save stays in your browser. No ticket, no redeploy, no “can you move that comma?” email.',
    primaryLabel: 'Next',
    enableEditing: true,
    scroll: 'center',
  },
  {
    id: 'inventory',
    path: '/',
    anchor: '[data-demo="inventory-slot"]',
    title: 'The lot is a JSON list.',
    body: 'These three spots are not hardcoded headlines. Pick another vehicle from the inventory file — the card updates, and the page stays shipped.',
    primaryLabel: 'Next',
    enableEditing: true,
    scroll: 'center',
  },
  {
    id: 'implement',
    path: '/',
    title: 'You can implement this today.',
    body: 'Ship a marketing site the founder can edit — instead of going back and forth on copy.',
    afterBody: IMPLEMENT_AFTER,
    primaryLabel: 'Finish the demo',
  },
];

const STEP_IDS = new Set(STEPS.map((item) => item.id));

function isTourStepId(value: string | null): value is TourStepId {
  return Boolean(value && STEP_IDS.has(value as TourStepId));
}

function visibleSteps(isAdmin: boolean): TourStep[] {
  return STEPS.filter((item) => !(item.skipIfAdmin && isAdmin));
}

const LAZY_EMAIL = 'lazy@demo.test';
const LAZY_PASSWORD = 'lazy';

function hiddenLoginForm() {
  return (
    document.querySelector<HTMLFormElement>('[data-demo="hidden-login-form"]') ??
    document.querySelector<HTMLFormElement>('[data-demo="login-card"] form')
  );
}

function setNativeValue(el: HTMLInputElement | HTMLTextAreaElement, value: string) {
  const proto = el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
  Object.getOwnPropertyDescriptor(proto, 'value')?.set?.call(el, value);
  el.dispatchEvent(new Event('input', { bubbles: true }));
  el.dispatchEvent(new Event('change', { bubbles: true }));
}

function fillHiddenLogin() {
  const form = hiddenLoginForm();
  if (!form) return false;
  const email =
    form.querySelector<HTMLInputElement>('input[type="email"]') ??
    form.querySelector<HTMLInputElement>('#hidden-login-email, #email, input[autocomplete="username"]');
  const pass =
    form.querySelector<HTMLInputElement>('input[type="password"]') ??
    form.querySelector<HTMLInputElement>('#hidden-login-pass, #pass, input[autocomplete="current-password"]');
  if (email) setNativeValue(email, LAZY_EMAIL);
  if (pass) setNativeValue(pass, LAZY_PASSWORD);
  return Boolean(email && pass);
}

function submitHiddenLogin() {
  const form = hiddenLoginForm();
  if (form) {
    form.requestSubmit();
    return true;
  }
  document.getElementById('hidden-login-email')?.focus();
  return false;
}

type DemoTourContextValue = {
  active: boolean;
  step: number;
  stepId: TourStepId | null;
  revealOwnerSignIn: boolean;
  start: () => void;
  continueFromInvite: () => void;
  goToSignIn: () => void;
};

const DemoTourContext = createContext<DemoTourContextValue | null>(null);

export function useDemoTour(): DemoTourContextValue {
  const ctx = useContext(DemoTourContext);
  if (!ctx) throw new Error('useDemoTour must be used within DemoTourProvider');
  return ctx;
}

function persist(active: boolean, id: TourStepId, visitor = false) {
  try {
    sessionStorage.setItem(ACTIVE_KEY, active ? '1' : '0');
    sessionStorage.setItem(STEP_KEY, id);
    sessionStorage.setItem(VISITOR_KEY, visitor ? '1' : '0');
  } catch {
    // private mode
  }
}

function readVisitorRun(): boolean {
  try {
    return sessionStorage.getItem(VISITOR_KEY) === '1';
  } catch {
    return false;
  }
}

function scrollElementIntoView(el: HTMLElement, block: ScrollLogicalPosition = 'center'): Promise<void> {
  const rect = el.getBoundingClientRect();
  const viewH = window.innerHeight;
  const alreadyIn = block === 'nearest' && rect.top >= 12 && rect.bottom <= viewH - 12;
  if (alreadyIn) return Promise.resolve();

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const offsetY = block === 'center' ? Math.max(24, (viewH - rect.height) / 2) : 24;
  gsap.killTweensOf(window);
  return new Promise((resolve) => {
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      resolve();
    };
    gsap.to(window, {
      scrollTo: { y: el, offsetY, autoKill: true },
      duration: reduce ? 0 : 0.55,
      ease: 'power3.inOut',
      onComplete: finish,
      onInterrupt: finish,
    });
    window.setTimeout(finish, reduce ? 0 : 700);
  });
}

function resolveTourAnchor(el: HTMLElement): HTMLElement {
  const inner = el.shadowRoot?.querySelector<HTMLElement>('button, [part="button"]');
  return inner ?? el;
}

export function DemoTourProvider({
  isAdmin,
  children,
}: {
  isAdmin: boolean;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [active, setActive] = useState(false);
  const [stepId, setStepId] = useState<TourStepId>('intro');
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const [visitorRun, setVisitorRun] = useState(false);
  const visitorRunRef = useRef(false);

  const treatAsVisitor = visitorRun || visitorRunRef.current;
  const vis = useMemo(() => {
    return visibleSteps(isAdmin && !treatAsVisitor);
  }, [isAdmin, treatAsVisitor]);
  const visibleIndex = Math.max(0, vis.findIndex((item) => item.id === stepId));
  const current = active ? (vis[visibleIndex] ?? null) : null;

  useEffect(() => setMounted(true), []);

  const applyStepId = useCallback(
    (id: TourStepId, nextActive = true) => {
      setActive(nextActive);
      setStepId(id);
      persist(nextActive, id, visitorRunRef.current);
      const target = STEPS.find((item) => item.id === id);
      if (nextActive && target && target.path !== window.location.pathname) {
        router.push(target.path);
      }
    },
    [router],
  );

  const start = useCallback(() => {
    clearFeatureDemoSessionDismissed(SEEN_ID);
    clearTourPopPosition();
    setDemoOwner(false);
    visitorRunRef.current = true;
    setVisitorRun(true);
    persist(true, 'intro', true);
    setEditing(false);
    if (isAdmin) {
      void fetch('/api/logout', { method: 'POST' }).then(() => router.refresh());
    }
    applyStepId('intro');
  }, [applyStepId, isAdmin, router]);

  const startRef = useRef(start);
  startRef.current = start;

  const stop = useCallback(() => {
    setActive(false);
    visitorRunRef.current = false;
    setVisitorRun(false);
    persist(false, 'intro', false);
    setAnchor(null);
    clearTourPopPosition();
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
      if (sessionStorage.getItem(ACTIVE_KEY) === '1') {
        const stored = sessionStorage.getItem(STEP_KEY);
        const asVisitor = readVisitorRun();
        visitorRunRef.current = asVisitor;
        setVisitorRun(asVisitor);
        setActive(true);
        if (isTourStepId(stored)) setStepId(stored);
        return undefined;
      }
      if (new URLSearchParams(window.location.search).get('featureDemo') === '1') {
        startRef.current();
        return undefined;
      }
      if (!isAdmin && !isDemoOwner() && shouldShowFeatureDemo(SEEN_ID, { enabled: true })) {
        const t = window.setTimeout(() => startRef.current(), 500);
        return () => window.clearTimeout(t);
      }
    } catch {
      // ignore
    }
    return undefined;
  }, [isAdmin, mounted]);

  useEffect(() => {
    const handler = () => start();
    window.addEventListener(START_SITE_TOUR_EVENT, handler);
    return () => window.removeEventListener(START_SITE_TOUR_EVENT, handler);
  }, [start]);

  useEffect(() => {
    if (!active) return;
    if (vis.some((item) => item.id === stepId)) return;
    const oldIndex = STEPS.findIndex((item) => item.id === stepId);
    const next = vis.find((item) => STEPS.indexOf(item) > oldIndex) ?? vis[vis.length - 1];
    if (next) applyStepId(next.id);
  }, [active, applyStepId, stepId, vis]);

  const revealOwnerSignIn = false;

  useEffect(() => {
    if (!active || !current) return;
    if (current.disableEditing) setEditing(false);
    if (current.enableEditing) setEditing(true);
  }, [active, current?.id]);

  useEffect(() => {
    if (!active || !current) return;
    if (current.path !== pathname) router.push(current.path);
  }, [active, current, pathname, router]);

  useEffect(() => {
    if (!active || current?.id !== 'sign-in') return;
    const onOwner = (event: Event) => {
      const owner = (event as CustomEvent<{ owner?: boolean }>).detail?.owner;
      if (owner) applyStepId('edit-chip');
    };
    window.addEventListener(DEMO_OWNER_EVENT, onOwner);
    return () => window.removeEventListener(DEMO_OWNER_EVENT, onOwner);
  }, [active, applyStepId, current?.id]);

  useEffect(() => {
    if (!active || !current || current.path !== pathname || !current.anchor) {
      setAnchor(null);
      return;
    }

    let cancelled = false;
    let raf = 0;
    let tries = 0;

    let scrolled = false;
    const find = () => {
      if (cancelled) return;
      const el = document.querySelector<HTMLElement>(current.anchor!);
      if (!el) {
        if (tries++ < 180) raf = requestAnimationFrame(find);
        return;
      }
      const resolved = resolveTourAnchor(el);
      setAnchor((prev) => (prev === resolved && prev.isConnected ? prev : resolved));
      if (!scrolled) {
        scrolled = true;
        if (current.id === 'edit-chip') {
          if (!cancelled) setAnchor(resolved);
        } else {
          void scrollElementIntoView(el, current.scroll ?? 'center').then(() => {
            if (cancelled) return;
            const next = document.querySelector<HTMLElement>(current.anchor!);
            if (next) setAnchor(resolveTourAnchor(next));
          });
        }
      }
      if (!resolved.isConnected || tries++ < 12) raf = requestAnimationFrame(find);
    };

    find();
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
    };
  }, [active, current?.anchor, current?.id, current?.path, current?.scroll, pathname]);

  const go = useCallback(
    (dir: 1 | -1) => {
      const next = visibleIndex + dir;
      if (dir === 1 && next >= vis.length) {
        finish('completed');
        return;
      }
      if (next < 0 || next >= vis.length) return;
      const target = vis[next];
      if (target) applyStepId(target.id);
    },
    [applyStepId, finish, vis, visibleIndex],
  );

  useEffect(() => {
    if (!active || current?.id !== 'edit-chip') return undefined;
    const host = document.querySelector<HTMLElement>('[data-demo="edit-chip"]');
    const btn = host?.shadowRoot?.querySelector<HTMLElement>('button, [part="button"]') ?? host;
    if (!btn) return undefined;
    let used = false;
    const onClick = () => {
      if (used) return;
      used = true;
      go(1);
    };
    btn.addEventListener('click', onClick);
    return () => btn.removeEventListener('click', onClick);
  }, [active, anchor, current?.id, go]);

  const beginVisitorWalkthrough = useCallback(() => {
    setDemoOwner(false);
    visitorRunRef.current = true;
    setVisitorRun(true);
    persist(true, 'invite', true);
    setEditing(false);
    if (isAdmin) {
      void fetch('/api/logout', { method: 'POST' }).then(() => router.refresh());
    }
    applyStepId('invite');
  }, [applyStepId, isAdmin, router]);

  const goToSignIn = useCallback(() => {
    visitorRunRef.current = true;
    setVisitorRun(true);
    persist(true, 'sign-in', true);
    setStepId('sign-in');
    setActive(true);
    if (window.location.pathname !== HIDDEN_LOGIN_PATH) {
      window.location.assign(HIDDEN_LOGIN_PATH);
    }
  }, []);

  const onPrimary = useCallback(() => {
    if (!current) return;
    if (current.id === 'intro') {
      beginVisitorWalkthrough();
      return;
    }
    if (current.id === 'implement') {
      finish('completed');
      return;
    }
    if (current.id === 'invite') {
      persist(true, 'sign-in', true);
      visitorRunRef.current = true;
      setVisitorRun(true);
      setStepId('sign-in');
      if (!current.primaryHref) goToSignIn();
      return;
    }
    if (current.id === 'sign-in') {
      submitHiddenLogin();
      return;
    }
    go(1);
  }, [beginVisitorWalkthrough, current, finish, go, goToSignIn]);

  const continueFromInvite = useCallback(() => {
    if (active && current?.id === 'intro') {
      beginVisitorWalkthrough();
      return;
    }
    if (active && current?.id === 'invite') {
      goToSignIn();
      return;
    }
    start();
  }, [active, beginVisitorWalkthrough, current?.id, goToSignIn, start]);

  const value = useMemo<DemoTourContextValue>(
    () => ({
      active,
      step: visibleIndex,
      stepId: current?.id ?? null,
      revealOwnerSignIn,
      start,
      continueFromInvite,
      goToSignIn,
    }),
    [active, continueFromInvite, current?.id, goToSignIn, revealOwnerSignIn, start, visibleIndex],
  );

  const onPath = Boolean(current && current.path === pathname);
  const liveAnchor = onPath && anchor && anchor.isConnected ? anchor : null;
  const isLast = visibleIndex >= vis.length - 1;
  const isIntro = current?.id === 'intro';
  const numbered = vis.filter((item) => item.id !== 'intro');
  const numberedIndex = current ? numbered.findIndex((item) => item.id === current.id) : -1;
  const stepLabel =
    current && !isIntro && numberedIndex >= 0
      ? `Step ${numberedIndex + 1} of ${numbered.length}`
      : undefined;

  return (
    <DemoTourContext.Provider value={value}>
      {children}
      {mounted && active && current && (
        <FeatureDemo
          open
          anchorEl={liveAnchor}
          anchorSelector={onPath ? current.anchor : undefined}
          placementKey={current.id}
          preferCenter={!current.anchor}
          waitingForAnchor={Boolean(current.anchor) && !liveAnchor}
          showPointer={current.id === 'edit-chip'}
          stepLabel={stepLabel}
          title={current.title}
          body={current.body}
          afterBody={current.afterBody}
          primaryLabel={current.primaryLabel ?? (isLast ? 'Finish' : 'Next')}
          primaryHref={current.primaryHref}
          onPrimary={onPrimary}
          belowPrimary={
            current.id === 'sign-in' ? (
              <button
                type="button"
                onClick={fillHiddenLogin}
                className="mt-1 text-[0.68rem] leading-tight text-zinc-500 underline decoration-zinc-500/40 underline-offset-2 transition-colors hover:text-zinc-300 hover:decoration-zinc-300"
              >
                fill for me. im lazy
              </button>
            ) : undefined
          }
          secondaryLabel={visibleIndex > 0 ? 'Back' : 'Not now'}
          onSecondary={visibleIndex > 0 ? () => go(-1) : () => finish('skipped')}
          tertiaryLabel={visibleIndex > 0 ? 'Skip tour' : undefined}
          onTertiary={visibleIndex > 0 ? () => finish('skipped') : undefined}
          onClose={() => finish('skipped')}
        />
      )}
    </DemoTourContext.Provider>
  );
}
