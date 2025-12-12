export interface User {
    username?: string;
    access_token: string;
    token_type: string;
    expires_in: number;
    message?: string;
    avatar_url?: string;
    display_name?: string;
    mission_success_count?: number;
    mission_joined_count?: number;
}
