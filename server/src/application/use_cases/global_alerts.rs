use crate::domain::{
    repositories::global_alerts::GlobalAlertRepository,
    value_objects::alert_model::{CreateAlertModel, GlobalAlertModel},
};
use anyhow::Result;
use std::sync::Arc;

pub struct GlobalAlertUseCase<T>
where
    T: GlobalAlertRepository + Send + Sync,
{
    repository: Arc<T>,
}

impl<T> GlobalAlertUseCase<T>
where
    T: GlobalAlertRepository + Send + Sync,
{
    pub fn new(repository: Arc<T>) -> Self {
        Self { repository }
    }

    pub async fn create_alert(&self, alert: CreateAlertModel) -> Result<i32> {
        self.repository.create_alert(alert).await
    }

    pub async fn get_alerts(&self) -> Result<Vec<GlobalAlertModel>> {
        self.repository.get_active_alerts().await
    }

    pub async fn deactivate(&self, alert_id: i32) -> Result<()> {
        self.repository.deactivate_alert(alert_id).await
    }
}
