import { createElement, Fragment, type ReactNode } from 'react';
import {
    formatDate,
    formatNumber,
    resolvePluralOption,
    resolveSelectOption,
    substitutePluralHash,
    type MessageNode,
} from './format';
import type { TranslationPrimitive } from './types';

export type RichTag = (chunks: ReactNode) => ReactNode;

export type RichComponents = Record<string, RichTag | ReactNode>;

export type RichTranslationValues = Record<string, TranslationPrimitive | ReactNode>;

export interface RichContext {
    values?: RichTranslationValues;
    locale: string;
    components?: RichComponents;
}

export function renderRichMessage(nodes: MessageNode[], ctx: RichContext): ReactNode {
    return createElement(
        Fragment,
        null,
        ...nodes.map((node, index) => renderNode(node, ctx, index)),
    );
}

function renderNode(node: MessageNode, ctx: RichContext, key: number): ReactNode {
    switch (node.type) {
        case 'text':
            return node.value;

        case 'arg': {
            const value = ctx.values?.[node.name];
            return value === undefined || value === null ? null : (value as ReactNode);
        }

        case 'number': {
            const value = ctx.values?.[node.name];
            return typeof value === 'number' ? formatNumber(value, node.style, ctx.locale) : null;
        }

        case 'date':
        case 'time': {
            const value = ctx.values?.[node.name];
            const date =
                value instanceof Date
                    ? value
                    : typeof value === 'number'
                      ? new Date(value)
                      : undefined;
            return date ? formatDate(date, node.type, node.style, ctx.locale) : null;
        }

        case 'plural': {
            const raw = ctx.values?.[node.name];
            const count = typeof raw === 'number' ? raw : Number(raw);
            if (Number.isNaN(count)) return null;
            const branch = substitutePluralHash(
                resolvePluralOption(count, node.options, ctx.locale),
                count,
                ctx.locale,
            );
            return createElement(
                Fragment,
                { key },
                ...branch.map((child, i) => renderNode(child, ctx, i)),
            );
        }

        case 'select': {
            const raw = ctx.values?.[node.name];
            const branch = resolveSelectOption(raw, node.options);
            return createElement(
                Fragment,
                { key },
                ...branch.map((child, i) => renderNode(child, ctx, i)),
            );
        }

        case 'tag': {
            const children = node.children.map((child, i) => renderNode(child, ctx, i));
            const component = ctx.components?.[node.name];

            if (typeof component === 'function') {
                return createElement(
                    Fragment,
                    { key },
                    (component as RichTag)(createElement(Fragment, null, ...children)),
                );
            }

            if (component !== undefined) {
                if (process.env.NODE_ENV !== 'production') {
                    console.warn(
                        `[i18n] Rich tag "<${node.name}>" was given a plain node, not a render function — its children were dropped. Pass "(chunks) => <tag>{chunks}</tag>" instead.`,
                    );
                }
                return createElement(Fragment, { key }, component);
            }

            if (process.env.NODE_ENV !== 'production') {
                console.warn(
                    `[i18n] No component provided for rich tag "<${node.name}>" — rendering its children only.`,
                );
            }
            return createElement(Fragment, { key }, ...children);
        }
    }
}
