import type { Metadata } from 'next';
import { Oswald, Source_Sans_3 } from 'next/font/google';
import { EditableHost } from '@/components/cms/editable-host';
import { DemoTourProvider } from '@/components/demo/site-tour';
import { SiteChrome } from '@/components/site-chrome';
import { peekAdmin } from '@/lib/admin-session';
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
  const admin = Boolean(await peekAdmin());

  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${oswald.variable} ${sourceSans.variable} h-full antialiased`}
    >
      <body className="lot-wash flex min-h-full flex-col">
        <DemoTourProvider isAdmin={admin}>
          <SiteChrome isAdmin={admin}>{children}</SiteChrome>
          <EditableHost isAdmin={admin} />
        </DemoTourProvider>
      </body>
    </html>
  );
}
