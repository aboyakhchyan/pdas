import { FileIcon, Icon } from '@pdas/ui/icons';

export default function HomePage() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center gap-6">
            <Icon icon={FileIcon} size={32} className="text-blue-600" />
        </main>
    );
}
