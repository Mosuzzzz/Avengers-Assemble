use serde::{Deserialize, Serialize};

use crate::domain::value_objects::mission_statuses::MissionStatus;


#[derive(Debug, Clone, Serialize, Deserialize, Default,PartialEq)]
pub struct MissionFilter {
    pub name: Option<String>,
    pub status: Option<MissionStatus>,
}