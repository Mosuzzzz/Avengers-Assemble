use crate::domain::{
    repositories::mission_intel::MissionIntelRepository,
    value_objects::intel_model::{AddIntelModel, MissionIntelModel},
};
use anyhow::Result;
use std::sync::Arc;

pub struct MissionIntelUseCase<T>
where
    T: MissionIntelRepository + Send + Sync,
{
    repository: Arc<T>,
}

impl<T> MissionIntelUseCase<T>
where
    T: MissionIntelRepository + Send + Sync,
{
    pub fn new(repository: Arc<T>) -> Self {
        Self { repository }
    }

    pub async fn add_intel(
        &self,
        mission_id: i32,
        brawler_id: i32,
        intel: AddIntelModel,
    ) -> Result<i32> {
        self.repository
            .add_intel(mission_id, brawler_id, intel)
            .await
    }

    pub async fn get_intel(&self, mission_id: i32) -> Result<Vec<MissionIntelModel>> {
        self.repository.get_intel_by_mission(mission_id).await
    }
}
