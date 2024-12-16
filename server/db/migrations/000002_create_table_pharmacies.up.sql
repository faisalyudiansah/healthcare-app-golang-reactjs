create extension if not exists postgis;

create table if not exists pharmacy_partners(
    id bigserial primary key,
    name varchar(255) not null unique,
    logo_url text not null,
    year_founded varchar not null,
    active_days varchar(255) not null,
    start_opt time not null,
    end_opt time not null,
    is_active boolean not null,
    created_at timestamp not null default current_timestamp,
    updated_at timestamp not null default current_timestamp
);

create table if not exists pharmacy_partner_changes(
    id bigserial primary key,
    partner_id bigint not null references pharmacy_partners(id),
    active_days varchar(255) not null,
    start_opt time not null,
    end_opt time not null,
    created_at timestamp not null default current_timestamp
);

create table if not exists logistics(
    id bigserial primary key, 
    code varchar(255) not null,
    service varchar(255) not null,
    min_delivery int not null,
    max_delivery int not null,
    price_per_km decimal not null,
    created_at timestamp not null default current_timestamp,
    updated_at timestamp not null default current_timestamp,
    constraint uc_logistic unique(code, service)
);

create table if not exists pharmacies(  
    id bigserial primary key,
    pharmacist_id bigint references users(id) default null,
    partner_id bigint not null references pharmacy_partners(id),
    name varchar(255) not null,
    address varchar(255) not null,
    city_id bigint not null,
    city varchar(255) not null,
    location geometry(point, 4326) not null unique,
    is_active boolean not null,
    created_at timestamp not null default current_timestamp,
    updated_at timestamp not null default current_timestamp,
    constraint uc_pharmacies unique(address, city)
);

create table if not exists pharmacy_logistics (
    id bigserial primary key,
    pharmacy_id bigint not null references pharmacies(id) on delete cascade,
    logistic_id bigint not null references logistics(id) on delete cascade,
    created_at timestamp not null default current_timestamp,
    updated_at timestamp not null default current_timestamp
);

create index if not exists idx_fk_partner_change_partner_id on pharmacy_partner_changes(partner_id);
create index if not exists idx_logistic_sla on logistics(max_delivery);
create index if not exists idx_pharmacy_location on pharmacies using gist (location);
create index if not exists idx_fk_pharmacy_pharmacist_id on pharmacies(pharmacist_id);
create index if not exists idx_fk_pharmacy_partner_id on pharmacies(partner_id);
create index if not exists idx_pharmacy_partners_opt ON pharmacy_partners (start_opt, end_opt);
create index if not exists idx_fk_pharmacy_logistic_pharmacy_id on pharmacy_logistics(pharmacy_id);
create index if not exists idx_fk_pharmacy_logistic_logistic_id on pharmacy_logistics(logistic_id);