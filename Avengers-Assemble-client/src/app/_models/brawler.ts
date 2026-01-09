export interface Brawler {
    displayname: string,
    avatar: string,
    mission_success_count: number,
    mission_join_count: number
}


export interface LoginData{
    username:string
    password:string
}

export interface RegisterData{
    username:string,
    password:string,
    display_name:string
}