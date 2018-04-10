# Setting up ubuntu DIGITALOCEAN
- `cat ~/.ssh/id_rsa.pub | ssh root@[your.ip.address.here] "cat >> ~/.ssh/authorized_keys"` - to set key on remote
- https://www.digitalocean.com/community/tutorials/how-to-use-ssh-keys-with-digitalocean-droplets
1. Create droplet with preferred specs
2. Add ssh key to enable ssh
3. Ssh into droplet and create new user - `adduser username`
4. Give user sudo permission - `usermod -aG sudo userName`
5. Become a new user - `su - userName`
6. Create a new directory for SSH stuff - `mkdir ~/.ssh`
7. Set the permissions to only allow this user into ~/.ssh - `chmod 700 ~/.ssh`
8. Create a file for ssh keys - `nano ~/.ssh/authorized_keys`
9. Copy your `id_rsa.pub` public key from local machne (same as you entered into digitalocean) into newly created `authorised_keys` file
10. After saving `authorised_keys`, make sure to add permission to only your user - `chmod 600 ~/.ssh/authorized_keys`
11. Type exit and ssh back in with userName@ip
12. Disable password login by modifying `sudo nano /etc/ssh/sshd_config` content. Inside, you need to update two settings `(ctrl + W to search, ctrl + X, Y, Enter to save in nano)`: `PermitRootLogin no` and `PasswordAuthentication no`
13. Reload configuration - `sudo systemctl reload sshd`
14. Try to ssh from another tab as root user and make sure you’re not allowed to do so

## SET UP A BASIC FIREWALL
1. Enable OpenSSH connections - `sudo ufw allow OpenSSH`
2. Enable HTTP traffic - `sudo ufw allow http`
3. Enable HTTPS traffic - `sudo ufw allow https`
4. Turn the firewall on - `sudo ufw enable`
5. Check the status - `sudo ufw status`

## SETUP ENVIRONMENT
1. Make sure git is installed
2. Setup node with nvm if needed
3. Generate keys and add to git https://help.github.com/articles/generating-a-new-ssh-key-and-adding-it-to-the-ssh-agent
4. Install `pm2`
5. Start your app automatically when server restarts - `pm2 startup` and follow instructions

## Setup locales
- https://github.com/certbot/certbot/issues/2883#issuecomment-216427925

## Instal letsencrypt
1. `sudo apt-get install bc`
2. `sudo git clone https://github.com/letsencrypt/letsencrypt /opt/letsencrypt`
3. Make sure you have your domain pointing to right ip by running `dig +short your.domain.com`

## Generate SSL certificates
1. `sudo systemctl stop apache2.service`
2. `sudo systemctl stop nginx`
3. `cd /opt/letsencrypt`
4. `sudo ./certbot-auto certonly --standalone`

## Setup auto cert renewal
1. `sudo crontab -e` - this will open cron config. At the bottom enter following: `00 1 * * 1 /opt/letsencrypt/certbot-auto renew >> /var/log/letsencrypt-renewal.log` and `30 1 * * 1 /bin/systemctl reload nginx`. This will try to renew certificates every monday 1am and restart nginx

## Install NGINX
1. `sudo apt-get install nginx`
2. `sudo nano /etc/nginx/sites-enabled/default` and enter following:

```
server {
    listen 80;
    listen [::]:80 default_server ipv6only=on;
    return 301 https://$host$request_uri;
}
```
```
server {
    # Enable HTTP/2
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name api.metabnb.com;

    # Use the Let’s Encrypt certificates
    ssl_certificate /etc/letsencrypt/live/api.metabnb.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.metabnb.com/privkey.pem;

    # Include the SSL configuration from cipherli.st
    include snippets/ssl-params.conf;

location / {
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-NginX-Proxy true;
        proxy_pass http://localhost:${server_port}/;
        proxy_ssl_session_reuse off;
        proxy_cache_bypass $http_upgrade;
        proxy_redirect off;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }
}
```

If `sudo nginx -t` fails then most likely one of config files for `nginx` has dulicate record for default server pointing to same port. Run `grep -R default_server /etc/nginx` to find where except for `/default` config you can see `default_server` in use and delete. Stop and start enginx again after removig the duplcate.

3. Create secure diffy helman group - `sudo openssl dhparam -out /etc/ssl/certs/dhparam.pem 2048`

4. Create SSL config file - `sudo nano /etc/nginx/snippets/ssl-params.conf` and enter following:
```
ssl_protocols TLSv1 TLSv1.1 TLSv1.2;
ssl_prefer_server_ciphers on;
ssl_ciphers "EECDH+AESGCM:EDH+AESGCM:AES256+EECDH:AES256+EDH";
ssl_ecdh_curve secp384r1; # Requires nginx >= 1.1.0
ssl_session_cache shared:SSL:10m;
ssl_session_tickets off; # Requires nginx >= 1.5.9
ssl_stapling on; # Requires nginx >= 1.3.7
ssl_stapling_verify on; # Requires nginx => 1.3.7
resolver 8.8.8.8 8.8.4.4 valid=300s;
resolver_timeout 5s;
add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload";
add_header X-Frame-Options DENY;
add_header X-Content-Type-Options nosniff;

# Add our strong Diffie-Hellman group
ssl_dhparam /etc/ssl/certs/dhparam.pem;
```
4.1 Test NGINX configration"
`sudo nginx -t` You should see following:
```
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful
```


5. Enable NGINX - `sudo systemctl start nginx`


# Setup mongo:
> Follow steps from - https://www.digitalocean.com/community/tutorials/how-to-install-and-secure-mongodb-on-ubuntu-16-04

1. Ssh into droplet and create new user - `adduser username`
2. Give user sudo permission - `usermod -aG sudo userName`
3. Become a new user - `su - userName`
4. Create a new directory for SSH stuff - `mkdir ~/.ssh`
5. Set the permissions to only allow this user into ~/.ssh - `chmod 700 ~/.ssh`
6. Create a file for ssh keys - `nano ~/.ssh/authorized_keys`
7. Copy your id_rsa.pub public key from local machine (same as you entered into digitalocean) into this `authorised_keys` file
8. After saving `authorised_keys`, make sure to add permission to only your user - `chmod 600 ~/.ssh/authorized_keys`
9. Type exit and ssh back in with newusername@ip
10. Disable password login by modifying `sudo nano /etc/ssh/sshd_config` content. Inside, you need to update two settings `(ctrl + W to search, ctrl + X, Y, Enter to save in nano):` `PermitRootLogin no` and `PasswordAuthentication no`
11. Reload configuration - `sudo systemctl reload sshd`
12. Try to ssh from another tab as root user and make sure you’re not allowed to do so
## Install mongo:
1. `sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 0C49F3730359A14518585931BC711F9BA15703C6`
2. `echo "deb [ arch=amd64,arm64 ] http://repo.mongodb.org/apt/ubuntu xenial/mongodb-org/3.4 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-3.4.list`
3. `sudo apt-get update`
4. `sudo apt-get install mongodb-org`
5. `sudo systemctl start mongod`
6. `sudo systemctl status mongod`
7. `sudo systemctl enable mongod`
## Add users with permisins:
1.
```
mongo;
use admin;
db.createUser({
  user: "danielAdmin",
  pwd: "password",
  roles:["root"]
});

use metabnb;
db.createUser({
  user: "daniel",
  pwd: "password",
  roles: [{
    role: "readWrite",
    db: "metabnb"
  }]
});
```
2. `sudo nano /etc/mongod.conf` and enter following:
```
security:
  authorization: "enabled"
```
3. `sudo systemctl restart mongod`
4. `sudo systemctl status mongod`
5. LOGIN to test if all works: `mongo -u useName -p --authenticationDatabase dbName`
6. `sudo ufw default deny incoming`
7. `sudo ufw default allow outgoing`
8. `sudo ufw allow ssh`
9. `sudo ufw allow from server.ip.address to any port 27017`
11. `sudo ufw enable`
12. `sudo ufw status`
13. open and modify `sudo nano /etc/mongod.conf`
```
net:
  port: 27017
  bindIp: 127.0.0.1,IP_of_MongoHost
```
14. `sudo systemctl restart mongod`
15. `sudo systemctl status mongod`

## Mongo dump / restore / cron jobs
1. refer to https://www.digitalocean.com/community/tutorials/how-to-back-up-restore-and-migrate-a-mongodb-database-on-ubuntu-14-04
2. copying files from local to remote example: `scp metabnb.zip daniel@159.89.11.146:/home/daniel/`
3. restore mongo from dump: `sudo mongorestore -d metabnb -u 'daniel' --authenticationDatabase metabnb -p 'password' ./metabnb/`
