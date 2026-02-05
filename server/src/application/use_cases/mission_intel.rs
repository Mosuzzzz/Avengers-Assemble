use crate::domain::{
    repositories::{
        mission_intel::MissionIntelRepository, mission_viewing::MissionViewingRepository,
    },
    value_objects::intel_model::{AddIntelModel, MissionIntelModel},
};
use anyhow::{Result, anyhow};
use std::sync::Arc;

pub struct MissionIntelUseCase<T, V>
where
    T: MissionIntelRepository + Send + Sync,
    V: MissionViewingRepository + Send + Sync,
{
    intel_repository: Arc<T>,
    viewing_repository: Arc<V>,
}

impl<T, V> MissionIntelUseCase<T, V>
where
    T: MissionIntelRepository + Send + Sync,
    V: MissionViewingRepository + Send + Sync,
{
    pub fn new(intel_repository: Arc<T>, viewing_repository: Arc<V>) -> Self {
        Self {
            intel_repository,
            viewing_repository,
        }
    }

    pub async fn add_intel(
        &self,
        mission_id: i32,
        brawler_id: i32,
        intel: AddIntelModel,
    ) -> Result<i32> {
        // Check if the brawler is a participant (Chief or Crew)
        let is_participant = self
            .viewing_repository
            .is_participant(mission_id, brawler_id)
            .await?;

        if !is_participant {
            return Err(anyhow!(
                "You must join the mission first to report operational intel."
            ));
        }

        self.intel_repository
            .add_intel(mission_id, brawler_id, intel)
            .await
    }

    pub async fn get_intel(&self, mission_id: i32) -> Result<Vec<MissionIntelModel>> {
        self.intel_repository.get_intel_by_mission(mission_id).await
    }
}
