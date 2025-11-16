use crate::domain::entities::brawlers::NewBrawler;

use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NewBrawlerModel {
    pub username: String,
    pub password: String,
}

impl NewBrawlerModel {
    pub fn to_entity(&self) -> NewBrawler {
        NewBrawler {
            username: self.username.clone(),
            password: self.password.clone(),
        }
    }
}