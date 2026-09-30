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
SESSION_SECRET=<generate-a-unique-random-secret>
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

## Privacy and GDPR readiness

The application provides an optional-storage choice, an account data export, and account deletion that removes profile/cart data and detaches identifying details from retained order records. These technical controls do not by themselves establish GDPR compliance. Before serving people protected by the GDPR, the controller should complete and maintain the following:

- Confirm the controller's full legal name and postal address, and whether an EEA/UK representative or Data Protection Officer is required. Update the public privacy notice with those verified details.
- Verify every actual data flow and recipient (including hosting, email, Google sign-in, Paystack, delivery, and image storage). Put required processor agreements and international-transfer safeguards in place, and correct the notice if any description is inaccurate.
- Set and document concrete retention periods for account, order, support, server-log, uploaded-file, and backup data. Confirm deletion requests also flow through processors and expire from backups on a defined schedule.
- Establish a process for verifying and answering access, correction, objection, restriction, portability, and erasure requests within applicable deadlines; define escalation for complaints and personal-data breaches.
- Review legal bases, marketing practices, data minimization, access controls, encryption, incident response, and whether a DPIA or records of processing are required for the actual operation.
- Keep optional trackers disabled unless they are integrated behind the recorded consent preferences and tested to remain blocked until valid consent. Re-test the privacy controls whenever scripts or providers change.

The privacy notice is a starting point and must be checked against the real operator, jurisdictions, providers, and retention obligations before launch. Obtain qualified privacy/legal advice for the business's circumstances.
