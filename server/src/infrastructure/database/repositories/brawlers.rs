use anyhow::{Ok, Result};
use async_trait::async_trait;
use chrono::{Duration, Utc};
// use diesel::{
//     ExpressionMethods, QueryDsl, RunQueryDsl, SelectableHelper, insert_into,
//     query_dsl::methods::{FilterDsl, SelectDsl},
// };
use diesel::{dsl::insert_into, prelude::*};
use std::sync::Arc;

use crate::{
    config::config_loader::get_jwt_env,
    domain::{
        entities::brawlers::{BrawlerEntity, RegisterBrawlerEntity},
        repositories::brawlers::BrawlerRepository,
        value_objects::{
            base64_img::Base64Img, mission_model::MissionModel, uploaded_img::UploadedImg,
        },
    },
    infrastructure::{
        cloudinary::{self, UploadImageOptions},
        database::{
            postgresql_connection::PgPoolSquad,
            schema::{brawlers, crew_memberships},
        },
        jwt::{
            generate_token,
            jwt_model::{Claims, Passport},
        },
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
    async fn register(&self, register_brawler_entity: RegisterBrawlerEntity) -> Result<Passport> {
        let mut connection = Arc::clone(&self.db_pool).get()?;

        let user_id = insert_into(brawlers::table)
            .values(&register_brawler_entity)
            .returning(brawlers::id)
            .get_result::<i32>(&mut connection)?;

        let display_name = register_brawler_entity.display_name;

        let jwt_env = get_jwt_env()?;
        let claims = Claims {
            sub: user_id.to_string(),
            exp: (Utc::now() + Duration::days(jwt_env.ttl)).timestamp() as usize,
            iat: Utc::now().timestamp() as usize,
        };
        let token = generate_token(jwt_env.secret, &claims)?;
        Ok(Passport {
            token,
            display_name,
            avatar_url: None,
        })
    }

    async fn find_by_username(&self, username: String) -> Result<BrawlerEntity> {
        let mut connection = Arc::clone(&self.db_pool).get()?;

        let result = brawlers::table
            .filter(brawlers::username.eq(username))
            .select(BrawlerEntity::as_select())
            .first::<BrawlerEntity>(&mut connection)?;

        Ok(result)
    }

    async fn upload_base64img(
        &self,
        user_id: i32,
        base64img: Base64Img,
        opt: UploadImageOptions,
    ) -> Result<UploadedImg> {
        let uploaded_img = cloudinary::upload(base64img, opt).await?;

        let mut conn = Arc::clone(&self.db_pool).get()?;

        diesel::update(brawlers::table)
            .filter(brawlers::id.eq(user_id))
            .set((
                brawlers::avatar_url.eq(uploaded_img.url.clone()),
                brawlers::avatar_public_id.eq(uploaded_img.public_id.clone()),
            ))
            .execute(&mut conn)?;

        Ok(uploaded_img)
    }

    async fn get_missions(&self, brawler_id: i32) -> Result<Vec<MissionModel>> {
        let mut conn = Arc::clone(&self.db_pool).get()?;

        // Use a raw SQL query to select the MissionModel fields including
        // the chief's display name and the crew count.
        let sql = r#"
SELECT
    missions.id,
    missions.name,
    missions.description,
    missions.status,
    missions.chief_id,
    brawlers.display_name AS chief_display_name,
    brawlers.avatar_url AS chief_avatar_url,
    (SELECT COUNT(*) FROM crew_memberships WHERE crew_memberships.mission_id = missions.id) AS crew_count,
    missions.created_at,
    missions.updated_at,
    CASE WHEN missions.password IS NOT NULL THEN true ELSE false END AS has_password,
    missions.password,
    missions.max_crew
FROM missions
LEFT JOIN brawlers ON brawlers.id = missions.chief_id
WHERE missions.deleted_at IS NULL
    AND missions.chief_id = $1
ORDER BY missions.created_at DESC
        "#;

        let results = diesel::sql_query(sql)
            .bind::<diesel::sql_types::Int4, _>(brawler_id)
            .load::<MissionModel>(&mut conn)?;

        Ok(results)
    }

    async fn crew_counting(&self, mission_id: i32) -> Result<u32> {
        let mut conn = Arc::clone(&self.db_pool).get()?;

        let result = crew_memberships::table
            .filter(crew_memberships::mission_id.eq(mission_id))
            .count()
            .first::<i64>(&mut conn)?;

        let count = u32::try_from(result)?;

        Ok(count)
    }

    async fn update_display_name(&self, brawler_id: i32, display_name: String) -> Result<()> {
        let mut conn = Arc::clone(&self.db_pool).get()?;

        diesel::update(brawlers::table)
            .filter(brawlers::id.eq(brawler_id))
            .set(brawlers::display_name.eq(display_name))
            .execute(&mut conn)?;

        Ok(())
    }

    async fn grant_xp(&self, brawler_ids: Vec<i32>, amount: i32) -> Result<()> {
        let mut conn = Arc::clone(&self.db_pool).get()?;

        diesel::update(brawlers::table)
            .filter(brawlers::id.eq_any(brawler_ids))
            .set(brawlers::xp.eq(brawlers::xp + amount))
            .execute(&mut conn)?;

        Ok(())
    }

    async fn get_profile(
        &self,
        brawler_id: i32,
    ) -> Result<crate::domain::value_objects::brawler_model::BrawlerModel> {
        let mut conn = Arc::clone(&self.db_pool).get()?;

        let sql = r#"
SELECT 
    id, 
    display_name, 
    avatar_url,
    xp,
    (SELECT COUNT(*) FROM missions WHERE missions.chief_id = brawlers.id AND missions.status = 'Completed') AS mission_success_count,
    (SELECT COUNT(*) FROM crew_memberships WHERE crew_memberships.brawler_id = brawlers.id) AS mission_joined_count
FROM brawlers
WHERE id = $1
        "#;

        let result = diesel::sql_query(sql)
            .bind::<diesel::sql_types::Int4, _>(brawler_id)
            .get_result::<crate::domain::value_objects::brawler_model::BrawlerModel>(&mut conn)?;

        Ok(result)
    }
}
