export interface Mission {
    id: number;
    name: string;
    description?: string;
    status: string;
    chief_id: number;
    chief_name?: string;
    chief_username?: string;
    crew_count: number;
    created_at: string;
    updated_at: string;
}

export interface MissionFilter {
    status?: string;
    name?: string;
}
