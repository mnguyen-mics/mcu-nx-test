#!/bin/bash
function sql_request() {
  echo "$1" > /tmp/request.sql
  sudo su - postgres -c "psql core_services --csv -f /tmp/request.sql"
}

# get the latest used id
id=$(sql_request "SELECT id FROM public.user ORDER BY id DESC LIMIT 1" |awk '/[0-9]$/ {id=$1+1;print id}')
password_configuration=$(sql_request "SELECT password_digest,password_hash_method,password_hash_iterations,password_hash_salt,password_pepper_generation FROM public.user WHERE email='dev@mediarithmics.com'"| awk '{if (NR==2) {print $0}}')
password_digest=$(echo $password_configuration|awk -F',' '{print $1}')
password_hash_method=$(echo $password_configuration|awk -F',' '{print $2}')
password_hash_iterations=$(echo $password_configuration|awk -F',' '{print $3}')
password_hash_salt=$(echo $password_configuration|awk -F',' '{print $4}')
password_pepper_generation=$(echo $password_configuration|awk -F',' '{print $5}')

# user already exists
sql_request "SELECT * FROM public.user WHERE email='test@mediarithmics.com'" | grep 'test@mediarithmics.com'
if [ $? -eq 1 ]; then
  echo 'User does not exist'
  # insert the user
  sql_request "INSERT INTO public.user (id, email, first_name, last_name, organisation_id,community_id, normalized_email) VALUES ($id, 'test@mediarithmics.com', 'test', 'qa', '1', '1', 'test@mediarithmics.com')"
fi

# update password
sql_request "UPDATE public.user SET password_digest='${password_digest}',password_hash_method='${password_hash_method}', password_hash_iterations='${password_hash_iterations}', password_hash_salt='${password_hash_salt}', password_pepper_generation='${password_pepper_generation}' WHERE email = 'test@mediarithmics.com'"

# force the password expiration
sql_request "UPDATE public.user SET last_password_update = last_password_update - INTERVAL '1 year' WHERE email = 'test@mediarithmics.com'"
