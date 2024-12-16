#!/bin/bash

USER="postgres"
PASSWORD="postgres"
HOST="localhost"
PORT=5432
DB="healthcare_db"

TABLES=( 'users' 'user_details' 'user_addresses' 'pharmacy_partners' 'pharmacies' 'logistics' 'pharmacy_logistics' 'category_products' 'manufactures' 'product_classifications' 'product_forms' 'products' 'product_categories' 'pharmacy_products' 'orders' 'order_products' 'user_cart_items' 'clusters')
N_TABLE=${#TABLES[@]}

pg_copy_csv_to_table(){
    local table=$1
    local file=$2

    psql postgresql://$USER:$PASSWORD@$HOST:$PORT/$DB -c "\copy $table from '/docker-entrypoint-initdb.d/$file' delimiter ',' CSV HEADER;"
}

reset_sequence(){
    local table=$1

    psql postgresql://$USER:$PASSWORD@$HOST:$PORT/$DB -c "SELECT setval(pg_get_serial_sequence('$table', 'id'), coalesce(max(id),0) + 1, false) FROM $table;"
}



for (( i=0;i<N_TABLE;i++ )); do
    table=${TABLES[${i}]}
    pg_copy_csv_to_table "$table" "$table.csv"
    reset_sequence "$table"
done