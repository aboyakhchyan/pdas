import type { Metadata } from 'next';
import { hasLocale } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@pdas/core/i18n/routing';
import { TranslationProvider } from '@pdas/core/i18n/translation';
import './globals.css';

export const metadata: Metadata = {
    title: 'PDAS Admin',
    description: 'Professional Document Automation System — admin panel',
    robots: { index: false, follow: false },
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
