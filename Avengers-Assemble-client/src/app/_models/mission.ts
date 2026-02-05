export interface Mission {
    id: number
    name: string
    description?: string
    status: string
    chief_id: number
    chief_display_name: string
    chief_avatar_url?: string
    crew_count: number
    created_at: Date
    updated_at: Date
    has_password: boolean
    max_crew: number
}