# Production deployment

This setup runs the API directly with Node.js and serves the Vite build with Nginx. Docker is not required.

## Backend

On the server, from `backend/`:

```sh
npm ci --omit=dev
npm start
```

Use a process manager such as PM2 so the API restarts after reboots:

```sh
npm install --global pm2
pm2 start server.js --name peep-api
pm2 save
pm2 startup
```

Set these production values in `backend/.env`:

```env
PORT=3000
FRONTEND_URL=https://peeponline.store
GOOGLE_CALLBACK_URL=https://api.peeponline.store/api/auth/google/callback
UPLOADS_DIR=/var/www/uploads
WATERMARK_PATH=/var/www/peeponline/frontend/public/logo.png
```

Keep the existing database, JWT, payment, email, and Google credentials in the server-only `.env` file. Do not commit that file.

Create the upload directory and grant the account running Node.js write access before starting the API:

```sh
sudo mkdir -p /var/www/uploads/products
sudo chown -R "$(id -un)":"$(id -gn)" /var/www/uploads
```

Run the API with the same user that owns this directory. If PM2 runs the API as `www-data` instead, use `sudo chown -R www-data:www-data /var/www/uploads`.

In Google Cloud Console, add this authorized redirect URI:

`https://api.peeponline.store/api/auth/google/callback`

## Frontend

From `frontend/`:

```sh
npm ci
npm run build
```

Upload the generated `frontend/dist/` directory to the web server document root for `peeponline.store`.

## Nginx

Use HTTPS certificates for both domains, then configure the API virtual host to proxy to Node.js:

```nginx
server {
    server_name api.peeponline.store;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Configure the frontend virtual host to serve the SPA and proxy uploaded assets:

```nginx
server {
    server_name peeponline.store www.peeponline.store;
    root /var/www/peeponline/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /uploads/ {
        proxy_pass https://api.peeponline.store;
        proxy_set_header Host api.peeponline.store;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Create DNS `A` records for `peeponline.store` and `api.peeponline.store` pointing to the server, then issue certificates with Certbot:

```sh
sudo certbot --nginx -d peeponline.store -d www.peeponline.store
sudo certbot --nginx -d api.peeponline.store
```

Verify the API before testing the browser app:

```sh
curl https://api.peeponline.store/api/health
```
