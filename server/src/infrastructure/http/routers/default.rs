use axum::{extract::Path, http::StatusCode, response::IntoResponse};

pub async fn health_check() -> impl IntoResponse {
    (StatusCode::OK, " All Right, I'am Good").into_response()
}

pub async fn make_error(Path(code): Path<u16>) -> impl IntoResponse {
    (StatusCode::INTERNAL_SERVER_ERROR, code.to_string()).into_response()
}
