use chrono::NaiveDateTime;
use diesel::prelude::*;
use diesel::sql_types::*;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, QueryableByName, Queryable, Selectable)]
#[diesel(table_name = crate::infrastructure::database::schema::global_alerts)]
pub struct GlobalAlertModel {
    #[diesel(sql_type = Int4)]
    pub id: i32,
    #[diesel(sql_type = Varchar)]
    pub title: String,
    #[diesel(sql_type = Text)]
    pub content: String,
    #[diesel(sql_type = Varchar)]
    pub level: String,
    #[diesel(sql_type = Bool)]
    pub is_active: bool,
    #[diesel(sql_type = Timestamp)]
    pub created_at: NaiveDateTime,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct CreateAlertModel {
    pub title: String,
    pub content: String,
    pub level: String,
}
