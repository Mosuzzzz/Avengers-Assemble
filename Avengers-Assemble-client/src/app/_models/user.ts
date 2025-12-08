export interface User {
    username?: string;
    access_token: string;
    token_type: string;
    expires_in: number;
    message?: string;
}
