use std::fmt::Display;

use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize,Default, PartialEq)]
pub enum MissionStatus {
    #[default]
    Open,
    InProgress,
    Completed,
    Failed,
}

impl Display for MissionStatus {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            MissionStatus::Open => write!(f, "Open"),
            MissionStatus::InProgress => write!(f, "In Progress"),
            MissionStatus::Completed => write!(f, "Completed"),
            MissionStatus::Failed => write!(f, "Failed"),
        }
    }
}