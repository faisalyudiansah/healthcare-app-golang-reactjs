create table if not exists user_cart_items(
    id bigserial primary key,
    user_id bigint not null references users(id),
    pharmacy_product_id bigint not null references pharmacy_products(id),
    quantity int not null,
    created_at timestamp not null default current_timestamp,
    updated_at timestamp not null default current_timestamp,
    constraint uc_cart_items unique(user_id, pharmacy_product_id)
);

create index if not exists idx_fk_cart_user_id on user_cart_items(user_id);
create index if not exists idx_fk_cart_pharmacy_product_id on user_cart_items(pharmacy_product_id);