CREATE EXTENSION IF NOT EXISTS postgis;

create table clusters(
    id bigserial primary key,
    province varchar(255) not null,
    city_id bigint not null,
    city varchar(255) not null,
    district varchar(255) not null,
    sub_district varchar(255) not null
);

create table if not exists users(
    id bigserial primary key,
    role int not null default 1,
    email varchar(255) not null unique,
    hash_password text default '',
    is_verified boolean not null default false,
    is_oauth boolean not null default false,
    created_at timestamp not null default current_timestamp,
    updated_at timestamp not null default current_timestamp,
    deleted_at timestamp default null
);

create table if not exists token_verification_users(
    id bigserial primary key,
    user_id bigint not null references users(id) on delete cascade,
    verification_token text not null,
    created_at timestamp not null default current_timestamp,
    updated_at timestamp not null default current_timestamp,
    deleted_at timestamp default null
);

create table if not exists user_details(
    id bigserial primary key, 
    user_id bigint not null references users(id) on delete cascade,
    full_name varchar(255) not null,
    sipa_number varchar(255) unique default null,
    whatsapp_number varchar(255) unique default null,
    years_of_experience int default null,
    image_url text not null,
    created_at timestamp not null default current_timestamp,
    updated_at timestamp not null default current_timestamp,
    deleted_at timestamp default null
);

create table if not exists user_addresses(
    id bigserial primary key,
    user_id bigint not null references users(id) on delete cascade,
    is_active boolean not null default false,
    location geometry(point, 4326) not null,
    address text not null unique,
    province varchar(255) not null,
    city_id bigint not null,
    city varchar(255) not null,
    district varchar(255) not null,
    sub_district varchar(255) not null,
    contact_name varchar(255) not null,
    contact_phone_number varchar(255) not null,
    created_at timestamp not null default current_timestamp,
    updated_at timestamp not null default current_timestamp,
    deleted_at timestamp default null,
    constraint uc_address unique(user_id, location)
);

create table if not exists token_reset_users(
    id bigserial primary key,
    user_id bigint not null references users(id) on delete cascade,
    reset_token text not null,
    created_at timestamp not null default current_timestamp,
    updated_at timestamp not null default current_timestamp,
    deleted_at timestamp default null
); 

create table if not exists refresh_token_users(
    id bigserial primary key,
    user_id bigint not null references users(id) on delete cascade,
    refresh_token text not null,
    jti text not null,
    created_at timestamp not null default current_timestamp,
    updated_at timestamp not null default current_timestamp
);

create index if not exists idx_user_email on users(email);
create index if not exists idx_user_role on users(role);
create index if not exists idx_user_is_oauth on users(is_oauth);
create index if not exists idx_fk_token_verification_user_id on token_verification_users(user_id);
create index if not exists idx_fk_user_profile_user_id on user_details(user_id);
create index if not exists idx_fk_user_address_user_id on user_addresses(user_id);
create index if not exists idx_fk_token_reset_user_id on token_reset_users(user_id);
create index if not exists idx_refresh_token_jti on refresh_token_users(jti);
create index if not exists idx_fk_refresh_token_user_id on refresh_token_users(user_id);