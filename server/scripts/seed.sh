#!/bin/bash

USER=$1
PASSWORD=$2
HOST=$3
PORT=$4
DB=$5
SSLMODE=$6

TABLES=( 'users' 'user_details' 'pharmacy_partners' 'pharmacies' 'logistics' 'pharmacy_logistics' 'category_products' 'manufactures' 'product_classifications' 'product_forms' 'products' 'product_categories' 'pharmacy_products' 'orders' 'order_products' 'user_cart_items')
N_TABLE=${#TABLES[@]}

pg_copy_csv_to_table(){
    local table=$1
    local file=$2

    psql postgresql://$USER:$PASSWORD@$HOST:$PORT/$DB?sslmode=$SSLMODE -c "\copy $table from './db/seeds/$file' delimiter ',' CSV HEADER;"
}

reset_sequence(){
    local table=$1

    psql postgresql://$USER:$PASSWORD@$HOST:$PORT/$DB?sslmode=$SSLMODE -c "SELECT setval(pg_get_serial_sequence('$table', 'id'), coalesce(max(id),0) + 1, false) FROM $table;"
}


for (( i=0;i<N_TABLE;i++ )); do
    table=${TABLES[${i}]}
    pg_copy_csv_to_table "$table" "$table.csv"
    reset_sequence "$table"
done
