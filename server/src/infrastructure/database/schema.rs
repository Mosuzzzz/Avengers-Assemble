// @generated automatically by Diesel CLI.

diesel::table! {
    brawlers (id) {
        id -> Int4,
        #[max_length = 255]
        username -> Varchar,
        #[max_length = 255]
        password -> Varchar,
        created_at -> Timestamp,
        updated_at -> Timestamp,
        #[max_length = 50]
        display_name -> Varchar,
        #[max_length = 512]
        avatar_url -> Nullable<Varchar>,
        #[max_length = 255]
        avatar_public_id -> Nullable<Varchar>,
        xp -> Int4,
    }
}

diesel::table! {
    mission_intel (id) {
        id -> Int4,
        mission_id -> Int4,
        brawler_id -> Int4,
        content -> Text,
        created_at -> Timestamp,
    }
}

diesel::table! {
    global_alerts (id) {
        id -> Int4,
        #[max_length = 255]
        title -> Varchar,
        content -> Text,
        #[max_length = 50]
        level -> Varchar,
        is_active -> Bool,
        created_at -> Timestamp,
    }
}

diesel::table! {
    crew_memberships (mission_id, brawler_id) {
        mission_id -> Int4,
        brawler_id -> Int4,
        joined_at -> Timestamp,
    }
}

diesel::table! {
    missions (id) {
        id -> Int4,
        #[max_length = 255]
        name -> Varchar,
        description -> Nullable<Text>,
        #[max_length = 255]
        status -> Varchar,
        chief_id -> Int4,
        avatar_url -> Nullable<Varchar>,
        created_at -> Timestamp,
        updated_at -> Timestamp,
        deleted_at -> Nullable<Timestamp>,
    }
}

diesel::joinable!(crew_memberships -> brawlers (brawler_id));
diesel::joinable!(crew_memberships -> missions (mission_id));
diesel::joinable!(missions -> brawlers (chief_id));

diesel::allow_tables_to_appear_in_same_query!(
    brawlers,
    crew_memberships,
    missions,
    mission_intel,
    global_alerts
);
