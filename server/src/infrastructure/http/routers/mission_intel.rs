use crate::{
    application::use_cases::mission_intel::MissionIntelUseCase,
    domain::{
        repositories::mission_intel::MissionIntelRepository,
        value_objects::intel_model::AddIntelModel,
    },
    infrastructure::{
        database::{
            postgresql_connection::PgPoolSquad, repositories::mission_intel::MissionIntelPostgres,
        },
        http::middlewares::auth::auth,
    },
};
use axum::{
    Extension, Json, Router,
    extract::{Path, State},
    http::StatusCode,
    middleware,
    response::IntoResponse,
    routing::{get, post},
};
use std::sync::Arc;

pub async fn add_intel<T>(
    State(use_case): State<Arc<MissionIntelUseCase<T>>>,
    Extension(user_id): Extension<i32>,
    Path(mission_id): Path<i32>,
    Json(payload): Json<AddIntelModel>,
) -> impl IntoResponse
where
    T: MissionIntelRepository + Send + Sync,
{
    match use_case.add_intel(mission_id, user_id, payload).await {
        Ok(id) => (StatusCode::CREATED, id.to_string()).into_response(),
        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()).into_response(),
    }
}

pub async fn get_intel<T>(
    State(use_case): State<Arc<MissionIntelUseCase<T>>>,
    Path(mission_id): Path<i32>,
) -> impl IntoResponse
where
    T: MissionIntelRepository + Send + Sync,
{
    match use_case.get_intel(mission_id).await {
        Ok(intel) => (StatusCode::OK, Json(intel)).into_response(),
        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()).into_response(),
    }
}

pub fn routes(db_pool: Arc<PgPoolSquad>) -> Router {
    let repository = MissionIntelPostgres::new(db_pool);
    let use_case = MissionIntelUseCase::new(Arc::new(repository));

    Router::new()
        .route("/{mission_id}", get(get_intel))
        .route(
            "/{mission_id}",
            post(add_intel).route_layer(middleware::from_fn(auth)),
        )
        .with_state(Arc::new(use_case))
}
