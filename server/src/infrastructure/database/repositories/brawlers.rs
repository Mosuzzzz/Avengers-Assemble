use anyhow::Result;
use async_trait::async_trait;
use diesel::{
    ExpressionMethods, RunQueryDsl, SelectableHelper, insert_into,
    query_dsl::methods::{FilterDsl, SelectDsl},
};
use std::sync::Arc;

use crate::{
    domain::{
        entities::brawlers::{BrawlerEntity, RegisterBrawlerEntity},
        repositories::brawlers::BrawlerRepository,
        value_objects::{base64_image::Base64Image, uploaded_image::UploadedImage},
    },
    infrastructure::{
        cloudinary::UploadImageOptions,
        database::{postgresql_connection::PgPoolSquad, schema::brawlers},
    },
};

pub struct BrawlerPostgres {
    db_pool: Arc<PgPoolSquad>,
}

impl BrawlerPostgres {
    pub fn new(db_pool: Arc<PgPoolSquad>) -> Self {
        Self { db_pool }
    }
}

#[async_trait]
impl BrawlerRepository for BrawlerPostgres {
    async fn register(&self, register_brawler_entity: RegisterBrawlerEntity) -> Result<i32> {
        let mut connection = Arc::clone(&self.db_pool).get()?;

        let result = insert_into(brawlers::table)
            .values(&register_brawler_entity)
            .returning(brawlers::id)
            .get_result::<i32>(&mut connection)?;

        Ok(result)
    }

    async fn find_by_username(&self, username: &String) -> Result<BrawlerEntity> {
        let mut connection = Arc::clone(&self.db_pool).get()?;

        let result = brawlers::table
            .filter(brawlers::username.eq(username))
            .select(BrawlerEntity::as_select())
            .first::<BrawlerEntity>(&mut connection)?;

        Ok(result)
    }
    async fn upload_avatar(
        &self,
        brawler_id: i32,
        base64_image: Base64Image,
        option: UploadImageOptions,
    ) -> Result<UploadedImage> {
        let uploaded_image =
            crate::infrastructure::cloudinary::upload(base64_image, option).await?;

        let mut conn = Arc::clone(&self.db_pool).get()?;

        diesel::update(brawlers::table)
            .filter(brawlers::id.eq(brawler_id))
            .set((
                brawlers::avatar_url.eq(uploaded_image.url.clone()),
                brawlers::avatar_public_id.eq(uploaded_image.public_id.clone()),
            ))
            .execute(&mut conn)?;

        Ok(uploaded_image)
    }

    async fn get_profile(
        &self,
        brawler_id: i32,
    ) -> Result<crate::domain::value_objects::brawler_model::BrawlerModel> {
        let mut conn = Arc::clone(&self.db_pool).get()?;

        let sql = r#"
            SELECT 
                b.display_name,
                COALESCE(b.avatar_url, '') AS avatar_url,
                b.username,
                COALESCE(s.success_count, 0) AS mission_success_count,
                COALESCE(j.joined_count, 0) AS mission_joined_count
            FROM 
                brawlers b
            LEFT JOIN 
                (
                    SELECT 
                        cm.brawler_id, 
                        COUNT(*) AS success_count
                    FROM 
                        crew_memberships cm
                    INNER JOIN 
                        missions m ON m.id = cm.mission_id
                    WHERE 
                        m.status = 'Completed'
                    GROUP BY 
                        cm.brawler_id
                ) s ON s.brawler_id = b.id
            LEFT JOIN 
                (
                    SELECT 
                        cm2.brawler_id, 
                        COUNT(*) AS joined_count
                    FROM 
                        crew_memberships cm2
                    GROUP BY 
                        cm2.brawler_id
                ) j ON j.brawler_id = b.id
            WHERE 
                b.id = $1
        "#;

        let result = diesel::sql_query(sql)
            .bind::<diesel::sql_types::Int4, _>(brawler_id)
            .get_result::<crate::domain::value_objects::brawler_model::BrawlerModel>(&mut conn)?;

        Ok(result)
    }
}
