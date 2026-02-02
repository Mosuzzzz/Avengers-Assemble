use crate::{
    application::use_cases::global_alerts::GlobalAlertUseCase,
    domain::{
        repositories::global_alerts::GlobalAlertRepository,
        value_objects::alert_model::CreateAlertModel,
    },
    infrastructure::database::{
        postgresql_connection::PgPoolSquad, repositories::global_alerts::GlobalAlertPostgres,
    },
};
use axum::{
    Json, Router,
    extract::State,
    http::StatusCode,
    response::IntoResponse,
    routing::{get, post},
};
use std::sync::Arc;

pub async fn get_alerts<T>(State(use_case): State<Arc<GlobalAlertUseCase<T>>>) -> impl IntoResponse
where
    T: GlobalAlertRepository + Send + Sync,
{
    match use_case.get_alerts().await {
        Ok(alerts) => (StatusCode::OK, Json(alerts)).into_response(),
        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()).into_response(),
    }
}

pub async fn create_alert<T>(
    State(use_case): State<Arc<GlobalAlertUseCase<T>>>,
    Json(payload): Json<CreateAlertModel>,
) -> impl IntoResponse
where
    T: GlobalAlertRepository + Send + Sync,
{
    match use_case.create_alert(payload).await {
        Ok(id) => (StatusCode::CREATED, id.to_string()).into_response(),
        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()).into_response(),
    }
}

pub fn routes(db_pool: Arc<PgPoolSquad>) -> Router {
    let repository = GlobalAlertPostgres::new(db_pool);
    let use_case = GlobalAlertUseCase::new(Arc::new(repository));

    Router::new()
        .route("/", get(get_alerts))
        .route("/", post(create_alert))
        .with_state(Arc::new(use_case))
}
