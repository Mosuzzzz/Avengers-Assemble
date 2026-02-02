use crate::{
    domain::{
        repositories::mission_intel::MissionIntelRepository,
        value_objects::intel_model::{AddIntelModel, MissionIntelModel},
    },
    infrastructure::database::{postgresql_connection::PgPoolSquad, schema::mission_intel},
};
use anyhow::{Context, Result};
use async_trait::async_trait;
use diesel::prelude::*;
use std::sync::Arc;

pub struct MissionIntelPostgres {
    db_pool: Arc<PgPoolSquad>,
}

impl MissionIntelPostgres {
    pub fn new(db_pool: Arc<PgPoolSquad>) -> Self {
        Self { db_pool }
    }
}

#[async_trait]
impl MissionIntelRepository for MissionIntelPostgres {
    async fn add_intel(
        &self,
        mission_id: i32,
        brawler_id: i32,
        intel: AddIntelModel,
    ) -> Result<i32> {
        let db_pool = Arc::clone(&self.db_pool);
        let id = tokio::task::spawn_blocking(move || -> Result<i32> {
            let mut conn = db_pool.get().context("Failed to get DB connection")?;

            diesel::insert_into(mission_intel::table)
                .values((
                    mission_intel::mission_id.eq(mission_id),
                    mission_intel::brawler_id.eq(brawler_id),
                    mission_intel::content.eq(intel.content),
                ))
                .returning(mission_intel::id)
                .get_result::<i32>(&mut conn)
                .context("Failed to add mission intel")
        })
        .await??;

        Ok(id)
    }

    async fn get_intel_by_mission(&self, mission_id: i32) -> Result<Vec<MissionIntelModel>> {
        let db_pool = Arc::clone(&self.db_pool);
        let results = tokio::task::spawn_blocking(move || -> Result<Vec<MissionIntelModel>> {
            let mut conn = db_pool.get().context("Failed to get DB connection")?;

            let sql = r#"
                SELECT 
                    mission_intel.id,
                    mission_intel.mission_id,
                    mission_intel.brawler_id,
                    brawlers.display_name AS brawler_display_name,
                    brawlers.avatar_url AS brawler_avatar_url,
                    mission_intel.content,
                    mission_intel.created_at
                FROM mission_intel
                JOIN brawlers ON brawlers.id = mission_intel.brawler_id
                WHERE mission_intel.mission_id = $1
                ORDER BY mission_intel.created_at ASC
            "#;

            diesel::sql_query(sql)
                .bind::<diesel::sql_types::Int4, _>(mission_id)
                .get_results::<MissionIntelModel>(&mut conn)
                .context("Failed to fetch mission intel")
        })
        .await??;

        Ok(results)
    }
}
