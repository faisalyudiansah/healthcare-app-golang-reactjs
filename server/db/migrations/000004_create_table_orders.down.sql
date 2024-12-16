drop table if exists orders cascade;
drop table if exists order_products cascade;
drop index if exists idx_orders_status_deleted_created;
drop index if exists idx_fk_order_user_id;
drop index if exists idx_fk_order_product_order_id;
drop index if exists idx_fk_order_product_product_id;
drop index if exists idx_fk_order_product_quantity;