import type { Metadata } from 'next';
import { Oswald, Source_Sans_3 } from 'next/font/google';
import { EditModeChip } from '@/components/cms/edit-mode-chip';
import { EditModeProvider } from '@/components/cms/edit-mode-provider';
import { DemoTourProvider } from '@/components/demo/site-tour';
import { SiteChrome } from '@/components/site-chrome';
import { peekAdmin } from '@/lib/admin-session';
import { EMPTY_PAGE_CONTENT } from '@/lib/copy';
import { copyStore } from '@/lib/copy-store';
import './globals.css';

const oswald = Oswald({
  subsets: ['latin'],
  variable: '--font-oswald',
});

const sourceSans = Source_Sans_3({
  subsets: ['latin'],
  variable: '--font-source',
});

const title = 'editable-website — in-place editable marketing site starter';
const description =
  'Next.js starter for an in-place editable marketing website. Founders edit page copy in place. Local JSON store you can swap for any CMS.';

export const metadata: Metadata = {
  title: {
    default: title,
    template: '%s · editable-website',
  },
  description,
  keywords: [
    'editable website',
    'inline editing',
    'visual editor',
    'contenteditable',
    'Next.js starter',
    'marketing website CMS',
    'headless CMS',
    'landing page editor',
    'TypeScript',
  ],
  authors: [{ name: 'Adam Siwiec' }],
  openGraph: {
    title,
    description,
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title,
    description,
  },
};

export default async function RootLayout({ children }: LayoutProps<'/'>) {
  const [admin, content] = await Promise.all([
    peekAdmin(),
    copyStore.get().catch(() => EMPTY_PAGE_CONTENT),
  ]);

  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${oswald.variable} ${sourceSans.variable} h-full antialiased`}
    >
      <body className="lot-wash flex min-h-full flex-col">
        <EditModeProvider isAdmin={Boolean(admin)} initial={content}>
          <DemoTourProvider>
            <SiteChrome isAdmin={Boolean(admin)}>{children}</SiteChrome>
            <EditModeChip />
          </DemoTourProvider>
        </EditModeProvider>
      </body>
    </html>
  );
}
