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

create index if not exists idx_orders_status_deleted_created on orders(order_status, deleted_at, created_at);
create index if not exists idx_fk_order_user_id on orders(user_id);
create index if not exists idx_fk_order_product_order_id on order_products(order_id);
create index if not exists idx_fk_order_product_product_id on order_products(pharmacy_product_id);
create index if not exists idx_fk_order_product_quantity on order_products(quantity);