import { Injectable } from '@nestjs/common';
import type { FieldGroup, Locale, ScalarNode } from '@pdas/core';
import { I18nService } from 'nestjs-i18n';
import type { TemplateVersion } from '@modules/templates/domain/interfaces/template-version.interface';
import type {
    HeadingLevel,
    PrintableBlock,
    PrintableDocument,
    PrintableField,
} from '@modules/rendering/domain/interfaces/printable-document.interface';
import type { Document } from '../../domain/entities/document.entity';

type ContentRecord = Record<string, unknown>;
type Translate = (key: 'yes' | 'no') => string;

/**
 * Lays a document's content out by its template blueprint: labels in the document's locale,
 * values formatted for print, blank fields skipped, nested groups as headings.
 */
@Injectable()
export class DocumentPrintout {
    constructor(private readonly i18n: I18nService) {}

    compose(document: Document, template: TemplateVersion): PrintableDocument {
        const { title, locale, content, updatedAt } = document.toProps();
        const translate: Translate = (key) => this.i18n.t(`pdf.${key}`, { lang: locale });
        return {
            title,
            locale,
            issuedAt: updatedAt,
            blocks: blocksOf(template.blueprint, content, { locale, translate }, 1),
        };
    }
}

interface PrintContext {
    locale: Locale;
    translate: Translate;
}

function blocksOf(
    group: FieldGroup,
    values: ContentRecord,
    context: PrintContext,
    level: HeadingLevel,
): PrintableBlock[] {
    const blocks: PrintableBlock[] = [];
    let rows: PrintableField[] = [];
    const closeRows = () => {
        if (rows.length > 0) blocks.push({ kind: 'fields', rows });
        rows = [];
    };

    for (const node of group.fields) {
        const value = values[node.key];
        if (isBlank(value)) continue;
        const label = node.label[context.locale];

        if (node.type === 'object' && isRecord(value)) {
            closeRows();
            blocks.push(heading(label, level), ...blocksOf(node, value, context, deeper(level)));
        } else if (node.type === 'list' && Array.isArray(value)) {
            closeRows();
            blocks.push(heading(label, level));
            value.filter(isRecord).forEach((item, index) => {
                blocks.push(heading(`${label} ${index + 1}`, deeper(level)));
                blocks.push(...blocksOf(node.item, item, context, deeper(deeper(level))));
            });
        } else if (node.type !== 'object' && node.type !== 'list') {
            rows.push({ label, value: formatScalar(node, value, context) });
        }
    }

    closeRows();
    return blocks;
}

function formatScalar(
    node: ScalarNode,
    value: unknown,
    { locale, translate }: PrintContext,
): string {
    switch (node.type) {
        case 'boolean':
            return translate(value === true ? 'yes' : 'no');
        case 'number':
            return typeof value === 'number'
                ? new Intl.NumberFormat(locale).format(value)
                : String(value);
        case 'money':
            return isMoney(value) ? formatMoney(value, locale) : String(value);
        case 'date':
            return typeof value === 'string' ? formatDate(value, locale) : String(value);
        case 'choice':
            return (Array.isArray(value) ? value : [value])
                .map(
                    (choice) =>
                        node.options.find((option) => option.value === choice)?.label[locale] ??
                        String(choice),
                )
                .join(', ');
        default:
            return String(value);
    }
}

function formatMoney({ amount, currency }: { amount: number; currency: string }, locale: Locale) {
    const format = new Intl.NumberFormat(locale, {
        style: 'currency',
        currency,
        currencyDisplay: 'code',
    });
    const minorDigits = format.resolvedOptions().maximumFractionDigits ?? 2;
    return format.format(amount / 10 ** minorDigits);
}

function formatDate(isoDate: string, locale: Locale): string {
    const date = new Date(`${isoDate}T00:00:00Z`);
    if (Number.isNaN(date.getTime())) return isoDate;
    return new Intl.DateTimeFormat(locale, { dateStyle: 'long', timeZone: 'UTC' }).format(date);
}

function heading(text: string, level: HeadingLevel): PrintableBlock {
    return { kind: 'heading', text, level };
}

function deeper(level: HeadingLevel): HeadingLevel {
    return level === 1 ? 2 : 3;
}

function isRecord(value: unknown): value is ContentRecord {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isMoney(value: unknown): value is { amount: number; currency: string } {
    return (
        isRecord(value) &&
        typeof value['amount'] === 'number' &&
        typeof value['currency'] === 'string'
    );
}

function isBlank(value: unknown): boolean {
    if (value === undefined || value === null) return true;
    if (typeof value === 'string') return value.trim().length === 0;
    if (Array.isArray(value)) return value.length === 0;
    return false;
}
