export interface Passport {
    token_type: string,
    access_token: string,
    expires_in: number,
    display_name: string,
    avatar_url?: string
}