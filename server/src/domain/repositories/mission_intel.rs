use crate::domain::value_objects::intel_model::{AddIntelModel, MissionIntelModel};
use anyhow::Result;
use async_trait::async_trait;

#[async_trait]
pub trait MissionIntelRepository {
    async fn add_intel(
        &self,
        mission_id: i32,
        brawler_id: i32,
        intel: AddIntelModel,
    ) -> Result<i32>;
    async fn get_intel_by_mission(&self, mission_id: i32) -> Result<Vec<MissionIntelModel>>;
}
