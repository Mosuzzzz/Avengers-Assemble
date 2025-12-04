#[cfg(test)]
mod tests {
    use std::sync::Arc;

    use crate::{
        application::use_cases::mission_operation::MissionOperationUseCase,
        domain::{
            entities::{ missions::MissionEntity,
            },
            repositories::{
                mission_operation::MockMissionOperationRepository,
                mission_viewing::MockMissionViewingRepository,
            },
            value_objects::mission_statuses::MissionStatus,
        },
    };

    #[tokio::test]
    async fn test_in_progress() {
        let mut mock_mission_operation_repository = MockMissionOperationRepository::new();
        let mut mock_mission_viewing_repository = MockMissionViewingRepository::new();

        mock_mission_viewing_repository
            .expect_crew_counting()
            .returning(|_| Box::pin(async { Ok(2) }));

        mock_mission_operation_repository
            .expect_in_progress()
            .returning(|_, _| Box::pin(async { Ok(1) }));
        mock_mission_viewing_repository
            .expect_view_detail()
            .returning(|_| {
                let now = chrono::Utc::now().naive_utc();
                Box::pin(async move {
                    Ok(MissionEntity {
                        id: 1,
                        name: "Test Mission".to_string(),
                        status: MissionStatus::Open.to_string(),
                        created_at: now,
                        updated_at: now,
                        description: None,
                        chief_id: 1,
                    })
                })
            });
        let use_case = MissionOperationUseCase::new(
            Arc::new(mock_mission_operation_repository),
            Arc::new(mock_mission_viewing_repository),
        );

        let result = use_case.in_progress(1, 1).await;

        assert!(result.is_ok())
    }

    #[tokio::test]
    async fn test_in_progress_crew_max() {
        

        let mock_mission_operation_repository = MockMissionOperationRepository::new();
        let mut mock_mission_viewing_repository = MockMissionViewingRepository::new();

        mock_mission_viewing_repository
            .expect_crew_counting()
            .returning(|_| Box::pin(async { Ok(10) }));

        mock_mission_viewing_repository
            .expect_view_detail()
            .returning(|_| {
                let now = chrono::Utc::now().naive_utc();
                Box::pin(async move {
                    Ok(MissionEntity {
                        id: 1,
                        name: "Test Mission".to_string(),
                        status: MissionStatus::Open.to_string(),
                        created_at: now,
                        updated_at: now,
                        description: None,
                        chief_id: 1,
                    })
                })
            });
        let use_case = MissionOperationUseCase::new(
            Arc::new(mock_mission_operation_repository),
            Arc::new(mock_mission_viewing_repository),
        );

        let result = use_case.in_progress(1, 1).await;

        assert!(result.is_err());
    }

    #[tokio::test]
    async fn test_in_progress_wrong_status() {
        let mock_mission_operation_repository = MockMissionOperationRepository::new();
        let mut mock_mission_viewing_repository = MockMissionViewingRepository::new();

        mock_mission_viewing_repository
            .expect_crew_counting()
            .returning(|_| Box::pin(async { Ok(1) }));
        mock_mission_viewing_repository
            .expect_view_detail()
            .returning(|_| {
                let now = chrono::Utc::now().naive_utc();
                Box::pin(async move {
                    Ok(MissionEntity {
                        id: 1,
                        name: "Test Mission".to_string(),
                        status: MissionStatus::Completed.to_string(),
                        created_at: now,
                        updated_at: now,
                        description: None,
                        chief_id: 1,
                    })
                })
            });
        let use_case = MissionOperationUseCase::new(
            Arc::new(mock_mission_operation_repository),
            Arc::new(mock_mission_viewing_repository),
        );

        let result = use_case.in_progress(1, 1).await;

        assert!(result.is_err());
    }

    #[tokio::test]
    async fn test_in_progress_wrong_chief_id() {
        let mock_mission_operation_repository = MockMissionOperationRepository::new();
        let mut mock_mission_viewing_repository = MockMissionViewingRepository::new();

        mock_mission_viewing_repository
            .expect_crew_counting()
            .returning(|_| Box::pin(async { Ok(1) }));
        mock_mission_viewing_repository
            .expect_view_detail()
            .returning(|_| {
                let now = chrono::Utc::now().naive_utc();
                Box::pin(async move {
                    Ok(MissionEntity {
                        id: 1,
                        name: "Test Mission".to_string(),
                        status: MissionStatus::Open.to_string(),
                        created_at: now,
                        updated_at: now,
                        description: None,
                        chief_id: 1,
                    })
                })
            });
        let use_case = MissionOperationUseCase::new(
            Arc::new(mock_mission_operation_repository),
            Arc::new(mock_mission_viewing_repository),
        );

        let result = use_case.in_progress(1, 10).await;

        assert!(result.is_err());
    }

    #[tokio::test]
    async fn test_to_completed() {
        let mut mock_mission_operation_repository = MockMissionOperationRepository::new();
        let mut mock_mission_viewing_repository = MockMissionViewingRepository::new();

        mock_mission_operation_repository
            .expect_to_completed()
            .returning(|_, _| Box::pin(async { Ok(1) }));
        mock_mission_viewing_repository
            .expect_view_detail()
            .returning(|_| {
                let now = chrono::Utc::now().naive_utc();
                Box::pin(async move {
                    Ok(MissionEntity {
                        id: 1,
                        name: "Test Mission".to_string(),
                        status: MissionStatus::InProgress.to_string(),
                        created_at: now,
                        updated_at: now,
                        description: None,
                        chief_id: 1,
                    })
                })
            });
        let use_case = MissionOperationUseCase::new(
            Arc::new(mock_mission_operation_repository),
            Arc::new(mock_mission_viewing_repository),
        );

        let result = use_case.to_completed(1, 1).await;

        assert!(result.is_ok());
    }

    #[tokio::test]
    async fn test_to_completed_wrong_status() {
        let mock_mission_operation_repository = MockMissionOperationRepository::new();
        let mut mock_mission_viewing_repository = MockMissionViewingRepository::new();

        mock_mission_viewing_repository
            .expect_view_detail()
            .returning(|_| {
                let now = chrono::Utc::now().naive_utc();
                Box::pin(async move {
                    Ok(MissionEntity {
                        id: 1,
                        name: "Test Mission".to_string(),
                        status: MissionStatus::Open.to_string(),
                        created_at: now,
                        updated_at: now,
                        description: None,
                        chief_id: 1,
                    })
                })
            });
        let use_case = MissionOperationUseCase::new(
            Arc::new(mock_mission_operation_repository),
            Arc::new(mock_mission_viewing_repository),
        );

        let result = use_case.to_completed(1, 1).await;

        assert!(result.is_err());
    }
    #[tokio::test]
    async fn test_to_completed_wrong_chief_id() {
        let mock_mission_operation_repository = MockMissionOperationRepository::new();
        let mut mock_mission_viewing_repository = MockMissionViewingRepository::new();

        mock_mission_viewing_repository
            .expect_view_detail()
            .returning(|_| {
                let now = chrono::Utc::now().naive_utc();
                Box::pin(async move {
                    Ok(MissionEntity {
                        id: 1,
                        name: "Test Mission".to_string(),
                        status: MissionStatus::InProgress.to_string(),
                        created_at: now,
                        updated_at: now,
                        description: None,
                        chief_id: 1,
                    })
                })
            });
        let use_case = MissionOperationUseCase::new(
            Arc::new(mock_mission_operation_repository),
            Arc::new(mock_mission_viewing_repository),
        );

        let result = use_case.to_completed(1, 10).await;

        assert!(result.is_err());
    }
    #[tokio::test]
    async fn test_to_failed() {
        let mut mock_mission_operation_repository = MockMissionOperationRepository::new();
        let mut mock_mission_viewing_repository = MockMissionViewingRepository::new();

        mock_mission_operation_repository
            .expect_to_failed()
            .returning(|_, _| Box::pin(async { Ok(1) }));
        mock_mission_viewing_repository
            .expect_view_detail()
            .returning(|_| {
                let now = chrono::Utc::now().naive_utc();
                Box::pin(async move {
                    Ok(MissionEntity {
                        id: 1,
                        name: "Test Mission".to_string(),
                        status: MissionStatus::InProgress.to_string(),
                        created_at: now,
                        updated_at: now,
                        description: None,
                        chief_id: 1,
                    })
                })
            });
        let use_case = MissionOperationUseCase::new(
            Arc::new(mock_mission_operation_repository),
            Arc::new(mock_mission_viewing_repository),
        );

        let result = use_case.to_failed(1, 1).await;

        assert!(result.is_ok());
    }
    #[tokio::test]
    async fn test_to_failed_wrong_status() {
        let mock_mission_operation_repository = MockMissionOperationRepository::new();
        let mut mock_mission_viewing_repository = MockMissionViewingRepository::new();

        mock_mission_viewing_repository
            .expect_view_detail()
            .returning(|_| {
                let now = chrono::Utc::now().naive_utc();
                Box::pin(async move {
                    Ok(MissionEntity {
                        id: 1,
                        name: "Test Mission".to_string(),
                        status: MissionStatus::Completed.to_string(),
                        created_at: now,
                        updated_at: now,
                        description: None,
                        chief_id: 1,
                    })
                })
            });
        let use_case = MissionOperationUseCase::new(
            Arc::new(mock_mission_operation_repository),
            Arc::new(mock_mission_viewing_repository),
        );

        let result = use_case.to_failed(1, 1).await;

        assert!(result.is_err());
    }
    #[tokio::test]
    async fn test_to_failed_wrong_chief_id() {
        let mock_mission_operation_repository = MockMissionOperationRepository::new();
        let mut mock_mission_viewing_repository = MockMissionViewingRepository::new();

        mock_mission_viewing_repository
            .expect_view_detail()
            .returning(|_| {
                let now = chrono::Utc::now().naive_utc();
                Box::pin(async move {
                    Ok(MissionEntity {
                        id: 1,
                        name: "Test Mission".to_string(),
                        status: MissionStatus::InProgress.to_string(),
                        created_at: now,
                        updated_at: now,
                        description: None,
                        chief_id: 1,
                    })
                })
            });
        let use_case = MissionOperationUseCase::new(
            Arc::new(mock_mission_operation_repository),
            Arc::new(mock_mission_viewing_repository),
        );

        let result = use_case.to_failed(1, 10).await;

        assert!(result.is_err());
    }
}
