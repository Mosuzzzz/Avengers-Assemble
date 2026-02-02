use chrono::NaiveDateTime;
use diesel::prelude::*;
use diesel::sql_types::*;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, QueryableByName)]
pub struct MissionIntelModel {
    #[diesel(sql_type = Int4)]
    pub id: i32,
    #[diesel(sql_type = Int4)]
    pub mission_id: i32,
    #[diesel(sql_type = Int4)]
    pub brawler_id: i32,
    #[diesel(sql_type = Varchar)]
    pub brawler_display_name: String,
    #[diesel(sql_type = Nullable<Varchar>)]
    pub brawler_avatar_url: Option<String>,
    #[diesel(sql_type = Text)]
    pub content: String,
    #[diesel(sql_type = Timestamp)]
    pub created_at: NaiveDateTime,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct AddIntelModel {
    pub content: String,
}
