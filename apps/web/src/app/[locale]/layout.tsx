import type { Metadata } from 'next';
import { hasLocale } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@pdas/core/i18n/routing';
import { TranslationProvider } from '@pdas/core/i18n/translation';
import './globals.css';

export const metadata: Metadata = {
    title: '',
    description: '',
    keywords: [],
    applicationName: '',
    authors: [],
    generator: '',
    referrer: 'origin-when-cross-origin',
    creator: '',
    publisher: '',
    metadataBase: undefined,
    alternates: {
        canonical: undefined,
        languages: {},
    },
    openGraph: {
        title: '',
        description: '',
        url: '',
        siteName: '',
        images: [],
        locale: '',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: '',
        description: '',
        images: [],
    },
    icons: {
        icon: undefined,
        shortcut: undefined,
        apple: undefined,
    },
    manifest: undefined,
    robots: {
        index: true,
        follow: true,
    },
    category: '',
};

export function generateStaticParams() {
    return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
    children,
    params,
}: Readonly<{
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
}>) {
    const { locale } = await params;
    if (!hasLocale(routing.locales, locale)) {
        notFound();
    }

    const messages = await getMessages();

    return (
        <html lang={locale}>
            <body className="antialiased">
                <TranslationProvider locale={locale} messages={messages}>
                    {children}
                </TranslationProvider>
            </body>
        </html>
    );
}
