export interface Mission {
    id: number;
    name: string;
    description?: string;
    status: string;
    chief_id: number;
    crew_count: number;
    created_at: string;
    updated_at: string;
}

export interface MissionFilter {
    status?: string;
    name?: string;
}
