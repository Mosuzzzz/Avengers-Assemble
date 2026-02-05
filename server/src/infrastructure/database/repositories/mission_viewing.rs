use std::sync::Arc;

use anyhow::{Ok, Result};
use async_trait::async_trait;
use diesel::prelude::*;

use crate::{
    domain::{
        repositories::mission_viewing::MissionViewingRepository,
        value_objects::{
            brawler_model::BrawlerModel, mission_filter::MissionFilter, mission_model::MissionModel,
        },
    },
    infrastructure::database::{postgresql_connection::PgPoolSquad, schema::crew_memberships},
};
pub struct MissionViewingPostgres {
    db_pool: Arc<PgPoolSquad>,
}

impl MissionViewingPostgres {
    pub fn new(db_pool: Arc<PgPoolSquad>) -> Self {
        Self { db_pool }
    }
}

#[async_trait]
impl MissionViewingRepository for MissionViewingPostgres {
    async fn crew_counting(&self, mission_id: i32) -> Result<i64> {
        let mut conn = Arc::clone(&self.db_pool).get()?;

        let value = crew_memberships::table
            .filter(crew_memberships::mission_id.eq(mission_id))
            .count()
            .first::<i64>(&mut conn)?;

        let count = i64::try_from(value)?;
        Ok(count)
    }

    async fn get_one(&self, mission_id: i32) -> Result<MissionModel> {
        let mut conn = Arc::clone(&self.db_pool).get()?;

        let sql = r#"
SELECT m.id,
        m.name,
        m.description,
        m.status,
        m.chief_id,
        COALESCE(b.display_name, '') AS chief_display_name,
        b.avatar_url AS chief_avatar_url,
        (SELECT COUNT(*) FROM crew_memberships cm WHERE cm.mission_id = m.id) AS crew_count,
        m.created_at,
        m.updated_at,
        CASE WHEN m.password IS NOT NULL THEN true ELSE false END AS has_password,
        m.password,
        m.max_crew
FROM missions m
LEFT JOIN brawlers b ON b.id = m.chief_id
WHERE m.deleted_at IS NULL
    AND m.id = $1
LIMIT 1
        "#;

        let result = diesel::sql_query(sql)
            .bind::<diesel::sql_types::Int4, _>(mission_id)
            .get_result::<MissionModel>(&mut conn)?;

        Ok(result)
    }

    async fn get_all(&self, mission_filter: &MissionFilter) -> Result<Vec<MissionModel>> {
        use diesel::sql_types::{Nullable, Varchar};

        let mut conn = Arc::clone(&self.db_pool).get()?;

        let sql = r#"
SELECT m.id,
        m.name,
        m.description,
        m.status,
        m.chief_id,
        COALESCE(b.display_name, '') AS chief_display_name,
        b.avatar_url AS chief_avatar_url,
        (SELECT COUNT(*) FROM crew_memberships cm WHERE cm.mission_id = m.id) AS crew_count,
        m.created_at,
        m.updated_at,
        CASE WHEN m.password IS NOT NULL THEN true ELSE false END AS has_password,
        m.password,
        m.max_crew
FROM missions m
LEFT JOIN brawlers b ON b.id = m.chief_id
WHERE m.deleted_at IS NULL
    AND ($1::varchar IS NULL OR m.status = $1)
    AND ($2::varchar IS NULL OR m.name ILIKE $2)
ORDER BY m.created_at DESC
        "#;

        // Prepare optional bind values
        let status_bind: Option<String> = mission_filter.status.as_ref().map(|s| s.to_string());
        let name_bind: Option<String> = mission_filter.name.as_ref().map(|n| format!("%{}%", n));

        let rows = diesel::sql_query(sql)
            .bind::<Nullable<Varchar>, _>(status_bind)
            .bind::<Nullable<Varchar>, _>(name_bind)
            .load::<MissionModel>(&mut conn)?;

        Ok(rows)
    }

    async fn get_crew(&self, mission_id: i32) -> Result<Vec<BrawlerModel>> {
        let sql = r#"
            SELECT b.id,
                    b.display_name,
                    b.avatar_url,
                    b.xp,
                    COALESCE(s.success_count, 0) AS mission_success_count,
                    COALESCE(j.joined_count, 0) AS mission_joined_count
            FROM crew_memberships cm
            INNER JOIN brawlers b ON b.id = cm.brawler_id
            LEFT JOIN (
                SELECT cm2.brawler_id, COUNT(*) AS success_count
                FROM crew_memberships cm2
                INNER JOIN missions m2 ON m2.id = cm2.mission_id
                WHERE m2.status = 'success'
                GROUP BY cm2.brawler_id
            ) s ON s.brawler_id = b.id
            LEFT JOIN (
                SELECT cm3.brawler_id, COUNT(*) AS joined_count
                FROM crew_memberships cm3
                GROUP BY cm3.brawler_id
            ) j ON j.brawler_id = b.id
            WHERE cm.mission_id = $1
        "#;

        let mut conn = Arc::clone(&self.db_pool).get()?;
        let brawler_list = diesel::sql_query(sql)
            .bind::<diesel::sql_types::Int4, _>(mission_id)
            .load::<BrawlerModel>(&mut conn)?;

        Ok(brawler_list)
    }

    async fn is_participant(&self, mission_id: i32, brawler_id: i32) -> Result<bool> {
        let mut conn = Arc::clone(&self.db_pool).get()?;
        use crate::infrastructure::database::schema::missions;

        // Check if chief
        let is_chief = missions::table
            .filter(missions::id.eq(mission_id))
            .filter(missions::chief_id.eq(brawler_id))
            .count()
            .get_result::<i64>(&mut conn)?
            > 0;

        if is_chief {
            return Ok(true);
        }

        // Check if crew member
        let is_crew = crew_memberships::table
            .filter(crew_memberships::mission_id.eq(mission_id))
            .filter(crew_memberships::brawler_id.eq(brawler_id))
            .count()
            .get_result::<i64>(&mut conn)?
            > 0;

        Ok(is_crew)
    }
}
