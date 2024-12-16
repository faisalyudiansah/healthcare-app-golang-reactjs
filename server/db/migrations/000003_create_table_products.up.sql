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