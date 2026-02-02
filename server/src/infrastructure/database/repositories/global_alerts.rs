use crate::{
    domain::{
        repositories::global_alerts::GlobalAlertRepository,
        value_objects::alert_model::{CreateAlertModel, GlobalAlertModel},
    },
    infrastructure::database::{postgresql_connection::PgPoolSquad, schema::global_alerts},
};
use anyhow::{Context, Result};
use async_trait::async_trait;
use diesel::prelude::*;
use std::sync::Arc;

pub struct GlobalAlertPostgres {
    db_pool: Arc<PgPoolSquad>,
}

impl GlobalAlertPostgres {
    pub fn new(db_pool: Arc<PgPoolSquad>) -> Self {
        Self { db_pool }
    }
}

#[async_trait]
impl GlobalAlertRepository for GlobalAlertPostgres {
    async fn create_alert(&self, alert: CreateAlertModel) -> Result<i32> {
        let db_pool = Arc::clone(&self.db_pool);
        let id = tokio::task::spawn_blocking(move || -> Result<i32> {
            let mut conn = db_pool.get().context("Failed to get DB connection")?;

            diesel::insert_into(global_alerts::table)
                .values((
                    global_alerts::title.eq(alert.title),
                    global_alerts::content.eq(alert.content),
                    global_alerts::level.eq(alert.level),
                ))
                .returning(global_alerts::id)
                .get_result::<i32>(&mut conn)
                .context("Failed to create global alert")
        })
        .await??;

        Ok(id)
    }

    async fn get_active_alerts(&self) -> Result<Vec<GlobalAlertModel>> {
        let db_pool = Arc::clone(&self.db_pool);
        let results = tokio::task::spawn_blocking(move || -> Result<Vec<GlobalAlertModel>> {
            let mut conn = db_pool.get().context("Failed to get DB connection")?;

            global_alerts::table
                .filter(global_alerts::is_active.eq(true))
                .order(global_alerts::created_at.desc())
                .load::<GlobalAlertModel>(&mut conn)
                .context("Failed to fetch active alerts")
        })
        .await??;

        Ok(results)
    }

    async fn deactivate_alert(&self, alert_id: i32) -> Result<()> {
        let db_pool = Arc::clone(&self.db_pool);
        tokio::task::spawn_blocking(move || -> Result<()> {
            let mut conn = db_pool.get().context("Failed to get DB connection")?;

            diesel::update(global_alerts::table)
                .filter(global_alerts::id.eq(alert_id))
                .set(global_alerts::is_active.eq(false))
                .execute(&mut conn)
                .context("Failed to deactivate alert")?;
            Ok(())
        })
        .await??;

        Ok(())
    }
}
