export interface MissionIntel {
    id: number;
    mission_id: number;
    brawler_id: number;
    brawler_display_name: string;
    brawler_avatar_url: string | null;
    content: string;
    created_at: string;
}

export interface AddIntel {
    content: string;
}
