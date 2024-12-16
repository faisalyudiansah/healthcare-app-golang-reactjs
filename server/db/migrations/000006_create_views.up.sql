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