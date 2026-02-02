use std::sync::Arc;

use anyhow::Result;

use crate::domain::{
    repositories::{
        brawlers::BrawlerRepository, mission_operation::MissionOperationRepository,
        mission_viewing::MissionViewingRepository,
    },
    value_objects::mission_statuses::MissionStatuses,
};
pub struct MissionOperationUseCase<T1, T2, T3>
where
    T1: MissionOperationRepository + Send + Sync,
    T2: MissionViewingRepository + Send + Sync,
    T3: BrawlerRepository + Send + Sync,
{
    mission_operation_repository: Arc<T1>,
    mission_viewing_repository: Arc<T2>,
    brawler_repository: Arc<T3>,
}

impl<T1, T2, T3> MissionOperationUseCase<T1, T2, T3>
where
    T1: MissionOperationRepository + Send + Sync,
    T2: MissionViewingRepository + Send + Sync,
    T3: BrawlerRepository + Send + Sync,
{
    pub fn new(
        mission_operation_repository: Arc<T1>,
        mission_viewing_repository: Arc<T2>,
        brawler_repository: Arc<T3>,
    ) -> Self {
        Self {
            mission_operation_repository,
            mission_viewing_repository,
            brawler_repository,
        }
    }

    pub async fn in_progress(&self, mission_id: i32, chief_id: i32) -> Result<i32> {
        let mission = self.mission_viewing_repository.get_one(mission_id).await?;

        let crew_count = self
            .mission_viewing_repository
            .crew_counting(mission_id)
            .await?;

        let is_status_open_or_fail = mission.status == MissionStatuses::Open.to_string()
            || mission.status == MissionStatuses::Failed.to_string();

        let max_crew_per_mission = std::env::var("MAX_CREW_PER_MISSION")
            .expect("missing value")
            .parse()?;

        let update_condition = is_status_open_or_fail
            && crew_count > 0
            && crew_count < max_crew_per_mission
            && mission.chief_id == chief_id;
        if !update_condition {
            return Err(anyhow::anyhow!("Invalid condition to change stages!"));
        }

        let result = self
            .mission_operation_repository
            .to_progress(mission_id, chief_id)
            .await?;
        Ok(result)
    }
    pub async fn to_completed(&self, mission_id: i32, chief_id: i32) -> Result<i32> {
        let mission = self.mission_viewing_repository.get_one(mission_id).await?;

        let update_condition = mission.status == MissionStatuses::InProgress.to_string()
            && mission.chief_id == chief_id;
        if !update_condition {
            return Err(anyhow::anyhow!("Invalid condition to change stages!"));
        }
        let result = self
            .mission_operation_repository
            .to_completed(mission_id, chief_id)
            .await?;

        // Grant XP to Chief and Crew
        let mut brawler_ids = vec![chief_id];
        let crew = self.mission_viewing_repository.get_crew(mission_id).await?;
        for member in crew {
            brawler_ids.push(member.id);
        }

        self.brawler_repository.grant_xp(brawler_ids, 100).await?;

        Ok(result)
    }
    pub async fn to_failed(&self, mission_id: i32, chief_id: i32) -> Result<i32> {
        let mission = self.mission_viewing_repository.get_one(mission_id).await?;

        let update_condition = mission.status == MissionStatuses::InProgress.to_string()
            && mission.chief_id == chief_id;
        if !update_condition {
            return Err(anyhow::anyhow!("Invalid condition to change stages!"));
        }
        let result = self
            .mission_operation_repository
            .to_failed(mission_id, chief_id)
            .await?;

        Ok(result)
    }
}
