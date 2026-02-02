use crate::domain::value_objects::alert_model::{CreateAlertModel, GlobalAlertModel};
use anyhow::Result;
use async_trait::async_trait;

#[async_trait]
pub trait GlobalAlertRepository {
    async fn create_alert(&self, alert: CreateAlertModel) -> Result<i32>;
    async fn get_active_alerts(&self) -> Result<Vec<GlobalAlertModel>>;
    async fn deactivate_alert(&self, alert_id: i32) -> Result<()>;
}
