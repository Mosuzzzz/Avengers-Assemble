
use std::sync::Arc;

use server::{config, infrastructure::{database::postgresql_connection, http::http_sev::start}};
use tracing::{error, info};

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt()
        .with_max_level(tracing::Level::DEBUG)
        .init();

    let dotenvy_env = match config::config_loader::load() {
        Ok(env) => env,
        Err(e) => {
            error!("Failed to load ENV: {}", e);
            std::process::exit(1);
        } 
    };
    
    let postgres_pool = match postgresql_connection::establish_connection(&dotenvy_env.database.url)
    {
        Ok(pool) => pool,
        Err(e) => {
            error!("Failed to establish connection to Postgres: {}", e);
            std::process::exit(1);
        }
    };


    info!("ENV has been loaded"); //info!("ENV has been loaded");

    start(Arc::new(dotenvy_env), Arc::new(postgres_pool))
        .await
        .expect("Faile to Start")
}
