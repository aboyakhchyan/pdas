import type { TranslationValues } from './types';

export type MessageNode =
    | { type: 'text'; value: string }
    | { type: 'arg'; name: string }
    | { type: 'number'; name: string; style?: string }
    | { type: 'date'; name: string; style?: string }
    | { type: 'time'; name: string; style?: string }
    | { type: 'plural'; name: string; options: Record<string, MessageNode[]> }
    | { type: 'select'; name: string; options: Record<string, MessageNode[]> }
    | { type: 'tag'; name: string; children: MessageNode[] };

export interface FormatContext {
    values?: TranslationValues;
    locale: string;
}

const parseCache = new Map<string, MessageNode[]>();

export function getParsedMessage(raw: string): MessageNode[] {
    const cached = parseCache.get(raw);
    if (cached) {
        return cached;
    }
    const parsed = parseMessage(raw);
    parseCache.set(raw, parsed);
    return parsed;
}

export function parseMessage(message: string): MessageNode[] {
    return parseNodes(message, 0, message.length).nodes;
}

function parseNodes(
    str: string,
    start: number,
    end: number,
): { nodes: MessageNode[]; nextIndex: number } {
    const nodes: MessageNode[] = [];
    let text = '';
    let i = start;

    const flushText = () => {
        if (text) {
            nodes.push({ type: 'text', value: text });
            text = '';
        }
    };

    while (i < end) {
        const ch = str[i];

        if (ch === '{') {
            flushText();
            const { node, nextIndex } = parseArgument(str, i);
            nodes.push(node);
            i = nextIndex;
            continue;
        }

        if (ch === '<') {
            const remainder = str.slice(i, end);

            if (/^<\/[a-zA-Z][\w-]*>/.exec(remainder)) {
                break;
            }

            const selfClosing = /^<([a-zA-Z][\w-]*)\s*\/>/.exec(remainder);
            if (selfClosing) {
                flushText();
                nodes.push({ type: 'tag', name: selfClosing[1]!, children: [] });
                i += selfClosing[0].length;
                continue;
            }

            const opening = /^<([a-zA-Z][\w-]*)>/.exec(remainder);
            if (opening) {
                flushText();
                const tagName = opening[1]!;
                const afterOpen = i + opening[0].length;
                const inner = parseNodes(str, afterOpen, end);
                let nextIndex = inner.nextIndex;
                const closeTag = `</${tagName}>`;
                if (str.slice(nextIndex, nextIndex + closeTag.length) === closeTag) {
                    nextIndex += closeTag.length;
                }
                nodes.push({ type: 'tag', name: tagName, children: inner.nodes });
                i = nextIndex;
                continue;
            }
        }

        text += ch;
        i++;
    }

    flushText();
    return { nodes, nextIndex: i };
}

function parseArgument(str: string, start: number): { node: MessageNode; nextIndex: number } {
    const { content, nextIndex } = extractBraced(str, start);
    const parts = splitTopLevel(content, ',');
    const name = (parts[0] ?? '').trim();

    if (parts.length === 1) {
        return { node: { type: 'arg', name }, nextIndex };
    }

    const kind = (parts[1] ?? '').trim();
    const rest = parts.slice(2).join(',');

    if (kind === 'plural') {
        return { node: { type: 'plural', name, options: parseOptions(rest) }, nextIndex };
    }

    if (kind === 'select') {
        return { node: { type: 'select', name, options: parseOptions(rest) }, nextIndex };
    }

    if (kind === 'number' || kind === 'date' || kind === 'time') {
        const style = (parts[2] ?? '').trim() || undefined;
        return { node: { type: kind, name, style }, nextIndex };
    }

    return { node: { type: 'arg', name }, nextIndex };
}

function parseOptions(raw: string): Record<string, MessageNode[]> {
    const options: Record<string, MessageNode[]> = {};
    let i = 0;

    while (i < raw.length) {
        while (i < raw.length && /\s/.test(raw[i]!)) i++;
        if (i >= raw.length) break;

        let selector = '';
        while (i < raw.length && !/\s/.test(raw[i]!) && raw[i] !== '{') {
            selector += raw[i];
            i++;
        }

        while (i < raw.length && /\s/.test(raw[i]!)) i++;
        if (raw[i] !== '{') break;

        const { content, nextIndex } = extractBraced(raw, i);
        options[selector] = parseMessage(content);
        i = nextIndex;
    }

    return options;
}

function extractBraced(str: string, start: number): { content: string; nextIndex: number } {
    let depth = 0;
    let i = start;
    let content = '';

    while (i < str.length) {
        const ch = str[i];

        if (ch === '{') {
            depth++;
            if (depth > 1) content += ch;
            i++;
            continue;
        }

        if (ch === '}') {
            depth--;
            if (depth === 0) {
                i++;
                break;
            }
            content += ch;
            i++;
            continue;
        }

        content += ch;
        i++;
    }

    return { content, nextIndex: i };
}

function splitTopLevel(str: string, separator: string): string[] {
    const result: string[] = [];
    let depth = 0;
    let current = '';

    for (const ch of str) {
        if (ch === '{') depth++;
        if (ch === '}') depth--;

        if (ch === separator && depth === 0) {
            result.push(current);
            current = '';
        } else {
            current += ch;
        }
    }

    result.push(current);
    return result;
}

export function resolvePluralOption(
    count: number,
    options: Record<string, MessageNode[]>,
    locale: string,
): MessageNode[] {
    const exact = options[`=${count}`];
    if (exact) return exact;

    const category = new Intl.PluralRules(locale).select(count);
    return options[category] ?? options.other ?? [];
}

export function resolveSelectOption(
    raw: unknown,
    options: Record<string, MessageNode[]>,
): MessageNode[] {
    return options[String(raw)] ?? options.other ?? [];
}

export function substitutePluralHash(
    nodes: MessageNode[],
    count: number,
    locale: string,
): MessageNode[] {
    const formatted = formatNumber(count, undefined, locale);
    return nodes.map((node) =>
        node.type === 'text' ? { ...node, value: node.value.replaceAll('#', formatted) } : node,
    );
}

export function formatNumber(value: number, style: string | undefined, locale: string): string {
    const options: Intl.NumberFormatOptions = {};
    if (style === 'percent') options.style = 'percent';
    else if (style === 'integer') options.maximumFractionDigits = 0;
    else if (style) options.style = style as Intl.NumberFormatOptions['style'];
    return new Intl.NumberFormat(locale, options).format(value);
}

export function formatDate(
    date: Date,
    kind: 'date' | 'time',
    style: string | undefined,
    locale: string,
): string {
    const dateStyle =
        kind === 'date'
            ? ((style as Intl.DateTimeFormatOptions['dateStyle']) ?? 'medium')
            : undefined;
    const timeStyle =
        kind === 'time'
            ? ((style as Intl.DateTimeFormatOptions['timeStyle']) ?? 'medium')
            : undefined;
    return new Intl.DateTimeFormat(locale, { dateStyle, timeStyle }).format(date);
}

export function formatToString(nodes: MessageNode[], ctx: FormatContext): string {
    return nodes.map((node) => formatNodeToString(node, ctx)).join('');
}

function formatNodeToString(node: MessageNode, ctx: FormatContext): string {
    switch (node.type) {
        case 'text':
            return node.value;

        case 'arg': {
            const value = ctx.values?.[node.name];
            return value === undefined || value === null ? '' : String(value);
        }

        case 'number': {
            const value = ctx.values?.[node.name];
            return typeof value === 'number' ? formatNumber(value, node.style, ctx.locale) : '';
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
            return date ? formatDate(date, node.type, node.style, ctx.locale) : '';
        }

        case 'plural': {
            const raw = ctx.values?.[node.name];
            const count = typeof raw === 'number' ? raw : Number(raw);
            if (Number.isNaN(count)) return '';
            const branch = substitutePluralHash(
                resolvePluralOption(count, node.options, ctx.locale),
                count,
                ctx.locale,
            );
            return formatToString(branch, ctx);
        }

        case 'select': {
            const raw = ctx.values?.[node.name];
            const branch = resolveSelectOption(raw, node.options);
            return formatToString(branch, ctx);
        }

        case 'tag':
            return formatToString(node.children, ctx);
    }
}
