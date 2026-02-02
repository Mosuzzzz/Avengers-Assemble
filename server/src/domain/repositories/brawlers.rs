use crate::{
    domain::{
        entities::brawlers::{BrawlerEntity, RegisterBrawlerEntity},
        value_objects::{
            base64_img::Base64Img, mission_model::MissionModel, uploaded_img::UploadedImg,
        },
    },
    infrastructure::{cloudinary::UploadImageOptions, jwt::jwt_model::Passport},
};
use anyhow::Result;
use async_trait::async_trait;

#[async_trait]
pub trait BrawlerRepository {
    async fn register(&self, register_brawler_entity: RegisterBrawlerEntity) -> Result<Passport>;
    async fn find_by_username(&self, username: String) -> Result<BrawlerEntity>;
    async fn upload_base64img(
        &self,
        user_id: i32,
        base64img: Base64Img,
        opt: UploadImageOptions,
    ) -> Result<UploadedImg>;

    async fn get_missions(&self, brawler_id: i32) -> Result<Vec<MissionModel>>;
    async fn crew_counting(&self, mission_id: i32) -> Result<u32>;
    async fn update_display_name(&self, brawler_id: i32, display_name: String) -> Result<()>;
    async fn grant_xp(&self, brawler_ids: Vec<i32>, amount: i32) -> Result<()>;
    async fn get_profile(
        &self,
        brawler_id: i32,
    ) -> Result<crate::domain::value_objects::brawler_model::BrawlerModel>;
}
