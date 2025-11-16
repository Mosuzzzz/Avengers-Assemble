use axum::{http::StatusCode, response::IntoResponse};

pub async fn not_found_handler() -> impl IntoResponse {
    (StatusCode::NOT_FOUND, "Not Found").into_response()
}

pub async fn health_check_handler() -> impl IntoResponse {
    (StatusCode::OK, "Ok").into_response()
}   