import type { DocumentSummary } from './document.interface';

export interface PageRequest {
    limit: number;
    cursor?: string;
}

export interface DocumentPage {
    items: DocumentSummary[];
    nextCursor: string | null;
}
