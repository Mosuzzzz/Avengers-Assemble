use anyhow::Result;
use diesel::{
    PgConnection,
    r2d2::{ConnectionManager, Pool},
};
use diesel_migrations::{EmbeddedMigrations, MigrationHarness, embed_migrations};

pub const MIGRATIONS: EmbeddedMigrations = embed_migrations!("src/infrastructure/database/migrations");

pub type PgPoolSquad = Pool<ConnectionManager<PgConnection>>;

pub fn establish_connection(database_url: &str) -> Result<PgPoolSquad> {
    let manager = ConnectionManager::<PgConnection>::new(database_url);
    let pool = Pool::builder().max_size(5).build(manager)?;

    let mut conn = pool.get()?;
    conn.run_pending_migrations(MIGRATIONS)
        .expect("Failed to run database migrations");

    Ok(pool)
}
