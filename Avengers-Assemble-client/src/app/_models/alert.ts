export interface GlobalAlert {
    id: number;
    title: string;
    content: string;
    level: 'Emergency' | 'God Level' | 'Info';
    is_active: boolean;
    created_at: string;
}
