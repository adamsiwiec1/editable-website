import { applyCopyPatch, copyPutBody, mergeCopy, parseCopyPayload, type CopyMap } from './copy.js';

export const CHANGE_EVENT = 'editable-website:change';

export type EditableState = {
  isAdmin: boolean;
  editing: boolean;
  saveError: string | null;
};

export type MountOptions = {
  root?: ParentNode | Document;
  isAdmin?: boolean;
  endpoints?: { copy?: string };
  fetchCopy?: () => Promise<{ copy?: CopyMap } | CopyMap>;
  saveCopy?: (key: string, value: string) => Promise<{ copy?: CopyMap } | CopyMap>;
};

type Runtime = {
  root: ParentNode;
  isAdmin: boolean;
  editing: boolean;
  copy: CopyMap;
  originals: WeakMap<Element, string>;
  saveError: string | null;
  copyUrl: string;
  fetchCopy?: MountOptions['fetchCopy'];
  saveCopy?: MountOptions['saveCopy'];
  observer: MutationObserver | null;
  onKey: ((event: KeyboardEvent) => void) | null;
  fields: Set<HTMLElement>;
};

const STYLE_ID = 'editable-website-styles';
const TEXT_CLASS = 'ew-text';
const BOUND_CLASS = 'ew-bound';

const PENCIL_SVG = `<svg viewBox="0 0 24 24" width="12" height="12" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>`;

let runtime: Runtime | null = null;
let pendingEditing: boolean | null = null;

export function getState(): EditableState | null {
  if (!runtime) return null;
  return { isAdmin: runtime.isAdmin, editing: runtime.editing, saveError: runtime.saveError };
}

function ownerDoc(root: ParentNode): Document {
  return root instanceof Document ? root : root.ownerDocument ?? document;
}

function emit() {
  if (typeof window === 'undefined' || !runtime) return;
  window.dispatchEvent(
    new CustomEvent<EditableState>(CHANGE_EVENT, {
      detail: { isAdmin: runtime.isAdmin, editing: runtime.editing, saveError: runtime.saveError },
    }),
  );
  document.querySelectorAll('editable-chip').forEach((node) => {
    if (isChip(node)) node.sync();
  });
}

function fieldKey(el: Element): string {
  return (el.getAttribute('data-copy') || el.getAttribute('copy-key') || el.getAttribute('key') || '').trim();
}

function isMultiline(el: Element): boolean {
  return el.hasAttribute('data-copy-multiline') || el.getAttribute('multiline') === '' || el.getAttribute('multiline') === 'true';
}

function textNode(el: HTMLElement): HTMLElement {
  const existing = el.querySelector<HTMLElement>(`:scope > .${TEXT_CLASS}`);
  if (existing) return existing;
  const wrap = el.ownerDocument.createElement('span');
  wrap.className = TEXT_CLASS;
  const leftovers = [...el.childNodes];
  for (const child of leftovers) wrap.append(child);
  el.insertBefore(wrap, el.firstChild);
  return wrap;
}

function readOriginal(el: HTMLElement): string {
  const cached = runtime?.originals.get(el);
  if (cached !== undefined) return cached;
  const node = el.querySelector<HTMLElement>(`:scope > .${TEXT_CLASS}`);
  const raw = (node ?? el).textContent ?? '';
  const original = raw.replace(/\u00a0/g, ' ');
  runtime?.originals.set(el, original);
  return original;
}

function applyField(el: HTMLElement) {
  if (!runtime) return;
  const key = fieldKey(el);
  if (!key) return;
  const node = textNode(el);
  if (node.isContentEditable) return;
  node.textContent = mergeCopy(runtime.copy, key, readOriginal(el));
}

function beginEdit(el: HTMLElement) {
  if (!runtime?.isAdmin || !runtime.editing) return;
  const node = textNode(el);
  if (node.isContentEditable) return;
  node.setAttribute('contenteditable', 'true');
  node.setAttribute('role', 'textbox');
  node.setAttribute('aria-label', `Edit ${fieldKey(el)}`);
  node.setAttribute('aria-multiline', isMultiline(el) ? 'true' : 'false');
  node.spellcheck = true;
  const range = el.ownerDocument.createRange();
  range.selectNodeContents(node);
  const sel = el.ownerDocument.defaultView?.getSelection();
  sel?.removeAllRanges();
  sel?.addRange(range);
  node.focus();
}

async function commitEdit(el: HTMLElement) {
  if (!runtime) return;
  const node = textNode(el);
  if (!node.isContentEditable) return;
  const next = (node.innerText ?? '').replace(/\u00a0/g, ' ');
  node.removeAttribute('contenteditable');
  node.removeAttribute('role');
  const key = fieldKey(el);
  const current = mergeCopy(runtime.copy, key, readOriginal(el));
  if (next.trim() === current.trim()) {
    node.textContent = current;
    return;
  }
  await saveKey(key, next);
}

function cancelEdit(el: HTMLElement) {
  if (!runtime) return;
  const node = textNode(el);
  node.removeAttribute('contenteditable');
  node.removeAttribute('role');
  applyField(el);
}

async function saveKey(key: string, value: string) {
  if (!runtime) return;
  const prev = runtime.copy;
  runtime.copy = applyCopyPatch(runtime.copy, key, value);
  runtime.saveError = null;
  syncFields();
  emit();
  try {
    const payload = runtime.saveCopy
      ? await runtime.saveCopy(key, value)
      : await defaultSave(runtime.copyUrl, key, value);
    runtime.copy = parseCopyPayload(payload);
    runtime.saveError = null;
    syncFields();
  } catch (err) {
    runtime.copy = prev;
    runtime.saveError = err instanceof Error ? err.message : 'Could not save';
    syncFields();
    emit();
    throw err;
  }
  emit();
}

async function defaultLoad(url: string): Promise<CopyMap> {
  const res = await fetch(url, { credentials: 'same-origin' });
  const body = (await res.json().catch(() => ({}))) as { error?: string };
  if (!res.ok) throw new Error(body.error ?? 'Could not load copy');
  return parseCopyPayload(body);
}

async function defaultSave(url: string, key: string, value: string): Promise<CopyMap> {
  const res = await fetch(url, {
    method: 'PUT',
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(copyPutBody(key, value)),
  });
  const body = (await res.json().catch(() => ({}))) as { error?: string };
  if (!res.ok) throw new Error(body.error ?? 'Could not save');
  return parseCopyPayload(body);
}

function bindField(el: HTMLElement) {
  if (!runtime || runtime.fields.has(el)) return;
  const key = fieldKey(el);
  if (!key) return;
  if (!el.getAttribute('data-copy')) el.setAttribute('data-copy', key);
  el.classList.add(BOUND_CLASS);
  readOriginal(el);
  textNode(el);
  applyField(el);

  el.addEventListener('click', (event) => {
    if (!runtime?.editing || !runtime.isAdmin) return;
    event.preventDefault();
    event.stopPropagation();
    beginEdit(el);
  });

  el.addEventListener(
    'keydown',
    (event) => {
      if (!textNode(el).isContentEditable) return;
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        cancelEdit(el);
        return;
      }
      if (event.key === 'Enter' && (!isMultiline(el) || event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        void commitEdit(el);
      }
    },
    true,
  );

  el.addEventListener('focusout', (event) => {
    if (!textNode(el).isContentEditable) return;
    const next = event.relatedTarget;
    if (next instanceof Node && el.contains(next)) return;
    void commitEdit(el);
  });

  runtime.fields.add(el);
}

function collectFields(root: ParentNode): HTMLElement[] {
  const found = [...root.querySelectorAll<HTMLElement>('[data-copy], editable-text')];
  if (root instanceof HTMLElement && (root.hasAttribute('data-copy') || root.localName === 'editable-text')) {
    found.unshift(root);
  }
  return found;
}

function bindTree(root: ParentNode) {
  for (const el of collectFields(root)) bindField(el);
}

function syncFields() {
  if (!runtime) return;
  for (const el of runtime.fields) {
    if (!el.isConnected) {
      runtime.fields.delete(el);
      continue;
    }
    applyField(el);
  }
}

function injectStyles(doc: Document) {
  if (doc.getElementById(STYLE_ID)) return;
  const style = doc.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
[data-copy].${BOUND_CLASS},
editable-text.${BOUND_CLASS} {
  position: relative;
}
html.ew-editing [data-copy].${BOUND_CLASS},
html.ew-editing editable-text.${BOUND_CLASS} {
  outline: 1px solid rgba(245, 185, 66, 0.4);
  outline-offset: 2px;
  cursor: text;
}
html.ew-editing [data-copy].${BOUND_CLASS}:is(span, a),
html.ew-editing editable-text.${BOUND_CLASS} {
  display: inline-block;
  max-width: 100%;
  vertical-align: baseline;
}
.${TEXT_CLASS} {
  outline: none;
}
[data-copy-multiline] > .${TEXT_CLASS} {
  white-space: pre-wrap;
}
html.ew-editing .${TEXT_CLASS}[contenteditable="true"] {
  border-radius: 2px;
  background: rgba(245, 185, 66, 0.1);
  box-shadow: 0 0 0 1px rgba(245, 185, 66, 0.6);
}
`;
  doc.head.append(style);
}

type ChipHost = HTMLElement & { sync(): void };

let ChipCtor: (new () => ChipHost) | null = null;

function isChip(node: Element): node is ChipHost {
  return Boolean(ChipCtor && node instanceof ChipCtor);
}

function defineElements() {
  if (typeof customElements === 'undefined' || typeof HTMLElement === 'undefined') return;

  if (!customElements.get('editable-chip')) {
    class EditableChipElement extends HTMLElement {
      private root: ShadowRoot | null = null;
      private button: HTMLButtonElement | null = null;
      private status: HTMLParagraphElement | null = null;

      connectedCallback() {
        if (!this.root) {
          this.root = this.attachShadow({ mode: 'open' });
          this.root.innerHTML = `
        <style>
          :host { position: fixed; right: 1rem; bottom: 1rem; z-index: 45; display: none; }
          :host([data-admin]) { display: inline-block; }
          button {
            display: inline-flex;
            min-height: 2.75rem;
            min-width: 2.75rem;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            border-radius: 999px;
            border: 1px solid rgba(251, 191, 36, 0.4);
            background: rgba(9, 9, 11, 0.9);
            color: #fde68a;
            padding: 0 0.9rem;
            font: 14px system-ui, sans-serif;
            cursor: pointer;
            box-shadow: 0 16px 40px rgba(0, 0, 0, 0.5);
          }
          button[aria-pressed="true"] {
            border-color: #fbbf24;
            background: #fbbf24;
            color: #09090b;
          }
          .err {
            position: absolute;
            right: 0;
            bottom: 100%;
            margin: 0 0 0.5rem;
            max-width: 14rem;
            border-radius: 6px;
            border: 1px solid rgba(255, 255, 255, 0.1);
            background: rgba(9, 9, 11, 0.95);
            color: #fda4af;
            padding: 0.5rem 0.75rem;
            font: 12px system-ui, sans-serif;
          }
        </style>
        <button type="button" part="button">${PENCIL_SVG}<span class="label">Edit the site</span></button>
        <p class="err" hidden></p>
      `;
          this.button = this.root.querySelector('button');
          this.status = this.root.querySelector('.err');
          this.button?.addEventListener('click', () => {
            setEditing(!runtime?.editing);
          });
        }
        if (!this.hasAttribute('data-demo')) this.setAttribute('data-demo', 'edit-chip');
        this.sync();
      }

      sync() {
        const admin = Boolean(runtime?.isAdmin);
        if (admin) this.setAttribute('data-admin', '');
        else this.removeAttribute('data-admin');
        if (!this.button || !this.status) return;
        const editing = Boolean(runtime?.editing);
        this.button.setAttribute('aria-pressed', editing ? 'true' : 'false');
        this.button.setAttribute('aria-label', editing ? 'Exit edit mode' : 'Edit the site');
        const label = this.button.querySelector('.label');
        if (label) label.textContent = editing ? 'Done' : 'Edit the site';
        if (runtime?.saveError) {
          this.status.hidden = false;
          this.status.textContent = runtime.saveError;
        } else {
          this.status.hidden = true;
          this.status.textContent = '';
        }
      }
    }
    ChipCtor = EditableChipElement;
    customElements.define('editable-chip', EditableChipElement);
  }

  if (!customElements.get('editable-text')) {
    class EditableTextElement extends HTMLElement {
      static get observedAttributes() {
        return ['key', 'copy-key'];
      }

      connectedCallback() {
        const key = this.getAttribute('copy-key') || this.getAttribute('key');
        if (key && !this.getAttribute('data-copy')) this.setAttribute('data-copy', key);
        if (runtime) bindField(this);
      }

      attributeChangedCallback() {
        const key = this.getAttribute('copy-key') || this.getAttribute('key');
        if (key) this.setAttribute('data-copy', key);
      }
    }
    customElements.define('editable-text', EditableTextElement);
  }
}

function onEscape(event: KeyboardEvent) {
  if (event.key !== 'Escape' || event.defaultPrevented) return;
  if (!runtime?.editing) return;
  setEditing(false);
}

export function setEditing(next: boolean) {
  if (!runtime) {
    pendingEditing = next;
    return;
  }
  runtime.editing = Boolean(next) && runtime.isAdmin;
  ownerDoc(runtime.root).documentElement.classList.toggle('ew-editing', runtime.editing);
  if (!runtime.editing) runtime.saveError = null;
  syncFields();
  emit();
}

export function unmount() {
  if (!runtime) return;
  if (runtime.onKey) ownerDoc(runtime.root).removeEventListener('keydown', runtime.onKey);
  runtime.observer?.disconnect();
  ownerDoc(runtime.root).documentElement.classList.remove('ew-editing');
  for (const el of runtime.fields) {
    const node = el.querySelector<HTMLElement>(`:scope > .${TEXT_CLASS}`);
    if (node) node.removeAttribute('contenteditable');
  }
  runtime = null;
  document.querySelectorAll('editable-chip').forEach((node) => {
    if (isChip(node)) node.sync();
  });
}

export async function mount(options: MountOptions = {}): Promise<void> {
  if (typeof document === 'undefined') return;
  unmount();
  defineElements();
  const root = options.root ?? document;
  const doc = root instanceof Document ? root : root.ownerDocument ?? document;
  injectStyles(doc);
  runtime = {
    root,
    isAdmin: Boolean(options.isAdmin),
    editing: false,
    copy: {},
    originals: new WeakMap(),
    saveError: null,
    copyUrl: options.endpoints?.copy ?? '/api/copy',
    fetchCopy: options.fetchCopy,
    saveCopy: options.saveCopy,
    observer: null,
    onKey: onEscape,
    fields: new Set(),
  };
  doc.addEventListener('keydown', onEscape);
  try {
    const payload = options.fetchCopy ? await options.fetchCopy() : await defaultLoad(runtime.copyUrl);
    runtime.copy = parseCopyPayload(payload);
  } catch {
    runtime.copy = {};
  }
  bindTree(root);
  const observer = new MutationObserver((records) => {
    for (const record of records) {
      for (const node of record.addedNodes) {
        if (node instanceof HTMLElement || node instanceof DocumentFragment) bindTree(node);
      }
    }
  });
  observer.observe(root instanceof Document ? root.body : root, { childList: true, subtree: true });
  runtime.observer = observer;
  if (pendingEditing !== null) {
    const next = pendingEditing;
    pendingEditing = null;
    setEditing(next);
    return;
  }
  emit();
}
