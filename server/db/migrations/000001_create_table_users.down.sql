drop table if exists clusters;
drop table if exists users cascade;
drop table if exists token_verification_users cascade;
drop table if exists user_details cascade;
drop table if exists user_addresses cascade;
drop table if exists reset_token_users cascade;
drop table if exists refresh_token_users cascade;

drop index if exists idx_user_email;
drop index if exists idx_fk_token_verification_user_id;
drop index if exists idx_fk_user_profile_user_id;
drop index if exists idx_fk_user_address_user_id;

drop index if exists idx_fk_token_reset_user_id;

drop index if exists idx_fk_refresh_token_user_id;