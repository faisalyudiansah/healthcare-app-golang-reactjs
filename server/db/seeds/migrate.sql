drop table if exists clusters;
drop table if exists users cascade;
drop table if exists token_verification_users cascade;
drop table if exists user_details cascade;
drop table if exists user_addresses cascade;
drop table if exists reset_token_users cascade;
drop table if exists refresh_token_users cascade;
drop table if exists pharmacy_partners cascade;
drop table if exists pharmacy_partner_changes cascade;
drop table if exists logistics cascade;
drop table if exists pharmacies cascade;
drop table if exists pharmacy_logistics cascade;
drop table if exists manufactures cascade;
drop table if exists product_classifications cascade;
drop table if exists product_forms cascade;
drop table if exists category_products cascade;
drop table if exists products cascade;
drop table if exists product_categories cascade;
drop table if exists pharmacy_products cascade;
drop table if exists orders cascade;
drop table if exists order_products cascade;
drop table if exists user_cart_items cascade;
drop materialized view if exists most_boughts_today;
drop materialized view if exists most_boughts_all_time;
drop index if exists idx_most_bought_today_rank;
drop index if exists idx_most_boughts_today_unique;
drop index if exists idx_most_bought_all_time_rank;
drop index if exists idx_most_boughts_all_time_unique;
drop index if exists idx_fk_cart_user_id;
drop index if exists idx_fk_cart_pharmacy_product_id;
drop index if exists idx_orders_status_deleted_created;
drop index if exists idx_fk_order_user_id;
drop index if exists idx_fk_order_product_order_id;
drop index if exists idx_fk_order_product_product_id;
drop index if exists idx_fk_order_product_quantity;
drop index if exists idx_product_filter;
drop index if exists idx_fk_product_manufacture_id;
drop index if exists idx_fk_product_classification_id;
drop index if exists idx_fk_product_form_id;
drop index if exists idx_product_unique;
drop index if exists idx_pharmacy_product_filter;
drop index if exists idx_fk_pharmacy_product_pharmacy_id;
drop index if exists idx_fk_pharmacy_product_product_id;
drop index if exists idx_fk_product_category_product_id;
drop index if exists idx_fk_product_category_category_id;
drop index if exists idx_fk_partner_change_partner_id; 
drop index if exists idx_logistic_sla; 
drop index if exists idx_pharmacy_location;
drop index if exists idx_fk_pharmacy_pharmacist_id; 
drop index if exists idx_fk_pharmacy_partner_id; 
drop index if exists idx_pharmacy_partners_opt;
drop index if exists idx_fk_pharmacy_logistic_pharmacy_id; 
drop index if exists idx_fk_pharmacy_logistic_logistic_id; 
drop index if exists idx_user_email;
drop index if exists idx_fk_token_verification_user_id;
drop index if exists idx_fk_user_profile_user_id;
drop index if exists idx_fk_user_address_user_id;
drop index if exists idx_fk_token_reset_user_id;
drop index if exists idx_fk_refresh_token_user_id;
create extension if not exists postgis;
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

create table if not exists manufactures(
    id bigserial primary key,
    name varchar(255) not null,
    created_at timestamp not null default current_timestamp,
    updated_at timestamp not null default current_timestamp
);

create table if not exists product_classifications(
    id bigserial primary key,
    name varchar(255) not null,
    created_at timestamp not null default current_timestamp,
    updated_at timestamp not null default current_timestamp
);

create table if not exists product_forms(
    id bigserial primary key,
    name varchar(255) not null,
    created_at timestamp not null default current_timestamp,
    updated_at timestamp not null default current_timestamp
);

create table if not exists category_products(
    id bigserial primary key,
    name varchar(255) not null unique,
    created_at timestamp not null default current_timestamp,
    updated_at timestamp not null default current_timestamp
);

create table if not exists products(
    id bigserial primary key,
    manufacture_id bigint not null references manufactures(id) on delete cascade,
    product_classification_id bigint not null references product_classifications(id),
    product_form_id bigint references product_forms(id) default null,
    name varchar(255) not null,
    generic_name text not null,
    description text not null,
    unit_in_pack varchar(255) default null,
    selling_unit varchar(255) default null,
    sold_amount bigint not null default 0,
    weight decimal not null,
    height decimal not null,
    length decimal not null,
    width decimal not null,
    thumbnail_url text default null,
    image_url text default null,
    secondary_image_url text default null,
    tertiary_image_url text default null,
    is_active boolean not null default true,
    created_at timestamp not null default current_timestamp,
    updated_at timestamp not null default current_timestamp,
    deleted_at timestamp default null,
    constraint uc_product unique(name, generic_name, manufacture_id, deleted_at)
);

create table if not exists product_categories(
    id bigserial primary key,
    product_id bigint not null references products(id),
    category_id bigint not null references category_products(id),
    created_at timestamp not null default current_timestamp,
    updated_at timestamp not null default current_timestamp,
    constraint uc_product_category unique(product_id, category_id)
);

create table if not exists pharmacy_products(
    id bigserial primary key,
    pharmacy_id bigint not null references pharmacies(id) on delete cascade,
    product_id bigint not null references products(id) on delete cascade,
    stock_quantity int not null,
    price decimal not null, 
    sold_amount bigint not null default 0,
    is_active boolean not null default true,
    created_at timestamp not null default current_timestamp,
    updated_at timestamp not null default current_timestamp,
    stock_quantity_updated_at timestamp default null,
    deleted_at timestamp default null,
    constraint uc_pharmacy_product unique(pharmacy_id, product_id)
);
create table if not exists orders(
    id bigserial primary key,
    user_id bigint not null references users(id),
    order_status varchar(255) not null,
    voice_number text not null unique,
    payment_img_url text null,
    total_product_price decimal not null,
    ship_cost decimal not null,
    total_payment decimal not null,
    description text default null,
    address text not null,
    created_at timestamp not null default current_timestamp,
    updated_at timestamp not null default current_timestamp,
    deleted_at timestamp default null
);

create table if not exists order_products(
    id bigserial primary key,
    order_id bigint not null references orders(id) on delete cascade,
    pharmacy_product_id bigint not null references pharmacy_products(id),
    quantity int not null,
    price decimal not null,
    created_at timestamp not null default current_timestamp,
    updated_at timestamp not null default current_timestamp
);

create table if not exists user_cart_items(
    id bigserial primary key,
    user_id bigint not null references users(id),
    pharmacy_product_id bigint not null references pharmacy_products(id),
    quantity int not null,
    created_at timestamp not null default current_timestamp,
    updated_at timestamp not null default current_timestamp,
    constraint uc_cart_items unique(user_id, pharmacy_product_id)
);

create materialized view if not exists most_boughts_today as
with today_sales as (
    select 
        pp.product_id, 
        sum(op.quantity) as total_sold
    from order_products op
    join orders o on o.id = op.order_id
    join pharmacy_products pp on pp.id = op.pharmacy_product_id
    where o.order_status in ('PROCESSED', 'SENT', 'CONFIRMED') 
    and o.deleted_at is null
    and o.created_at >= now() - interval '7 days'
    and pp.stock_quantity > 0
    and pp.is_active = true
    group by pp.product_id
    order by total_sold desc
    limit 500
)
select 
    pc.id as product_classification_id,
    pc.name as product_classification_name,
    pp.id as pharmacy_product_id,
    p.id as product_id, 
    p.name as product_name, 
    pp.stock_quantity, 
    pp.price, 
    t.total_sold, 
    p.selling_unit, 
    p.thumbnail_url,
    p.is_active as is_active,
    row_number() over (partition by p.id order by pp.price asc) as rank
from products p
left join product_classifications pc on p.product_classification_id = pc.id
left join pharmacy_products pp on p.id = pp.product_id
left join today_sales t on p.id = t.product_id
where t.total_sold >= 0
order by total_sold desc;

create materialized view if not exists most_boughts_all_time as
with top_products as (
    select
        p.id AS product_id,
        p.name AS product_name,
        p.selling_unit,
        p.sold_amount
    from products p
    order by p.sold_amount desc
    limit 500
),
cheapest_prices as (
    select
        tp.product_id,
        pp.id as pharmacy_product_id,
        pp.price,
        pp.stock_quantity,
        row_number() over (partition by tp.product_id order by pp.price asc) as rank
    from top_products tp
    join pharmacy_products pp ON tp.product_id = pp.product_id
    where pp.stock_quantity > 0 and pp.is_active = true
)
select
    pc.id as product_classification_id,
    pc.name as product_classification_name,
    cp.pharmacy_product_id as pharmacy_product_id,
    tp.product_id as product_id,
    tp.product_name as product_name,
    tp.selling_unit,
    tp.sold_amount,
    cp.price,
    cp.stock_quantity,
    p.thumbnail_url,
    p.is_active,
    cp.rank
from top_products tp
join cheapest_prices cp on tp.product_id = cp.product_id
join products p on tp.product_id = p.id
join product_classifications pc on p.product_classification_id = pc.id
order by tp.sold_amount desc;

create or replace function refresh_most_boughts_view()
returns void as $$
begin
    refresh materialized view concurrently most_boughts_today;
    refresh materialized view concurrently most_boughts_all_time;
end;
$$ language plpgsql;

create index if not exists idx_most_bought_today_rank on most_boughts_today(is_active, rank);
create unique index if not exists idx_most_boughts_today_unique on most_boughts_today (product_id, rank);
create index if not exists idx_most_bought_all_time_rank on most_boughts_all_time(is_active, rank);
create unique index if not exists idx_most_boughts_all_time_unique on most_boughts_all_time (product_id, rank);
create index if not exists idx_fk_cart_user_id on user_cart_items(user_id);
create index if not exists idx_fk_cart_pharmacy_product_id on user_cart_items(pharmacy_product_id);
create index if not exists idx_orders_status_deleted_created on orders(order_status, deleted_at, created_at);
create index if not exists idx_fk_order_user_id on orders(user_id);
create index if not exists idx_fk_order_product_order_id on order_products(order_id);
create index if not exists idx_fk_order_product_product_id on order_products(pharmacy_product_id);
create index if not exists idx_fk_order_product_quantity on order_products(quantity);
create index if not exists idx_product_filter on products(sold_amount, is_active);
create index if not exists idx_fk_product_manufacture_id on products(manufacture_id);
create index if not exists idx_fk_product_classification_id on products(product_classification_id);
create index if not exists idx_fk_product_form_id on products(product_form_id);
create index if not exists idx_product_unique on products(name, generic_name, manufacture_id);
create index if not exists idx_pharmacy_product_filter on pharmacy_products(price, stock_quantity, is_active);
create index if not exists idx_fk_pharmacy_product_pharmacy_id on pharmacy_products(pharmacy_id);
create index if not exists idx_fk_pharmacy_product_product_id on pharmacy_products(product_id);
create index if not exists idx_fk_product_category_product_id on product_categories(product_id);
create index if not exists idx_fk_product_category_category_id on product_categories(category_id);
create index if not exists idx_fk_partner_change_partner_id on pharmacy_partner_changes(partner_id);
create index if not exists idx_logistic_sla on logistics(max_delivery);
create index if not exists idx_pharmacy_location on pharmacies using gist (location);
create index if not exists idx_fk_pharmacy_pharmacist_id on pharmacies(pharmacist_id);
create index if not exists idx_fk_pharmacy_partner_id on pharmacies(partner_id);
create index if not exists idx_pharmacy_partners_opt ON pharmacy_partners (start_opt, end_opt);
create index if not exists idx_fk_pharmacy_logistic_pharmacy_id on pharmacy_logistics(pharmacy_id);
create index if not exists idx_fk_pharmacy_logistic_logistic_id on pharmacy_logistics(logistic_id);
create index if not exists idx_user_email on users(email);
create index if not exists idx_user_role on users(role);
create index if not exists idx_user_is_oauth on users(is_oauth);
create index if not exists idx_fk_token_verification_user_id on token_verification_users(user_id);
create index if not exists idx_fk_user_profile_user_id on user_details(user_id);
create index if not exists idx_fk_user_address_user_id on user_addresses(user_id);
create index if not exists idx_fk_token_reset_user_id on token_reset_users(user_id);
create index if not exists idx_refresh_token_jti on refresh_token_users(jti);
create index if not exists idx_fk_refresh_token_user_id on refresh_token_users(user_id);