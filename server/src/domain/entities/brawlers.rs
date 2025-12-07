use std::sync::Arc;

use crate::{domain::value_objects::{base64_image::Base64Image, uploaded_image::UploadedImage}, infrastructure::{cloudinary::{self, UploadImageOptions}, database::{postgresql_connection::PgPoolSquad, schema::brawlers}}};
use chrono::NaiveDateTime;
use diesel::{Selectable, prelude::*};
use anyhow::Result;

#[derive(Debug, Clone, Identifiable, Selectable, Queryable)]
#[diesel(table_name = brawlers)]
pub struct BrawlerEntity {
    pub id: i32,
    pub username: String,
    pub password: String,
    pub created_at: NaiveDateTime,
    pub updated_at: NaiveDateTime,
    pub display_name: String,
    pub avatar_url: Option<String>,
    pub avatar_public_id: Option<String>,
}

#[derive(Debug, Clone, Insertable)]
#[diesel(table_name = brawlers)]
pub struct RegisterBrawlerEntity {
    pub username: String,
    pub password: String,
    pub display_name: String,
}


#[async_trait::async_trait]
pub trait BrawlerRepository {
    async fn register(&self, register_brawler_entity: RegisterBrawlerEntity) -> Result<i32>;
    async fn find_by_username(&self, username: &String) -> Result<BrawlerEntity>;
    async fn upload_avatar(
        &self,
        db_pool: Arc<PgPoolSquad>,
        brawler_id: i32,
        base64_image: Base64Image,
        option: UploadImageOptions,
    )-> Result<UploadedImage>{
        let uploaded_image = cloudinary::upload(base64_image, option).await?;

        let mut conn = Arc::clone(&db_pool).get()?;

        diesel::update(brawlers::table)
            .filter(brawlers::id.eq(brawler_id))
            .set((
                brawlers::avatar_url.eq(uploaded_image.url.clone()),
                brawlers::avatar_public_id.eq(uploaded_image.public_id.clone()),
            ))
            .execute(&mut conn)?;   
        
        Ok(uploaded_image)
    }
}