# Hướng dẫn tối ưu production BUYCODE.VN

Tài liệu này áp dụng cho frontend Next.js 16 và backend Laravel 12 của dự án. Mục tiêu là giảm TTFB, tránh request trang chủ chờ đủ 10 giây và giữ giao diện ổn định trong lúc dữ liệu đang tải.

## 1. Các thay đổi đã có trong frontend

- Dữ liệu công khai `site-settings`, `navigation-menus`, slideshow và chi tiết sản phẩm được cache có thời hạn.
- Request server-side mặc định dừng sau 3,5 giây thay vì 10 giây và trả dữ liệu dự phòng.
- Header, hero và footer được stream độc lập bằng React Suspense.
- Skeleton giữ trước chiều cao nội dung, giảm nhảy bố cục.
- Next.js được build theo chế độ `standalone` để triển khai gọn trên VPS/cPanel.
- Next server có thể gọi backend bằng mạng nội bộ qua `API_INTERNAL_URL`.

`feedback.js` trong cột Initiator của DevTools thường là script được công cụ hoặc extension trình duyệt chèn vào. Hãy kiểm tra lại bằng cửa sổ ẩn danh không extension. Thời gian của request document vẫn là số cần quan tâm, đặc biệt các chỉ số `Waiting for server response` và TTFB.

## 2. Biến môi trường frontend

Tạo `.env.production` trước khi chạy `npm run build`:

```dotenv
NODE_ENV=production

# URL trình duyệt truy cập được. Giá trị NEXT_PUBLIC được đóng vào bundle lúc build.
NEXT_PUBLIC_API_URL=https://api.buycode.vn/api

# URL chỉ Next server sử dụng. Nếu frontend và API cùng VPS, dùng loopback.
API_INTERNAL_URL=http://127.0.0.1:8080/api

# Khoảng chờ backend server-side. Nên giữ trong khoảng 2500-5000 ms.
SERVER_API_TIMEOUT_MS=3500

# TTL cho menu, logo, cài đặt và slideshow. Thay đổi admin có thể trễ tối đa TTL này.
PUBLIC_DATA_REVALIDATE_SECONDS=60
```

Không đặt `NEXT_PUBLIC_API_URL=http://127.0.0.1...` trên production vì URL này cũng chạy trong trình duyệt người dùng. Chỉ `API_INTERNAL_URL` được dùng loopback/private network.

## 3. Triển khai frontend trên VPS

Yêu cầu khuyến nghị: Node.js 22 LTS, Nginx, PM2, HTTPS và tối thiểu 1 GB RAM. Nếu build ngay trên VPS nhỏ, nên có swap 1-2 GB.

```bash
cd /var/www/buycodevn-frontend
npm ci
npm run test
npm run build

# Standalone cần static và public nằm cạnh server.js.
cp -r public .next/standalone/
mkdir -p .next/standalone/.next
cp -r .next/static .next/standalone/.next/

cd .next/standalone
PORT=3000 HOSTNAME=127.0.0.1 pm2 start server.js --name buycodevn-frontend
pm2 save
pm2 startup
```

Sau mỗi lần thay `.env.production`, phải build lại vì biến `NEXT_PUBLIC_*` được ghi vào bundle khi build.

### Nginx cho frontend

```nginx
upstream buycode_frontend {
    keepalive 32;
    server 127.0.0.1:3000;
}

server {
    listen 443 ssl http2;
    server_name buycode.vn www.buycode.vn;

    # Khai báo ssl_certificate và ssl_certificate_key tại đây.

    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/json application/javascript image/svg+xml;

    location /_next/static/ {
        proxy_pass http://buycode_frontend;
        expires 1y;
        add_header Cache-Control "public, max-age=31536000, immutable";
        access_log off;
    }

    location / {
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Connection "";
        proxy_connect_timeout 3s;
        proxy_read_timeout 60s;
        proxy_pass http://buycode_frontend;
    }
}
```

Không ép cache HTML của `/user`, `/admin`, trang thanh toán hoặc API có xác thực tại Nginx/Cloudflare. Có thể cache dài hạn `/_next/static/*` vì tên file đã có hash.

## 4. Backend Laravel trên VPS

Ví dụ `.env` production quan trọng:

```dotenv
APP_ENV=production
APP_DEBUG=false
APP_URL=https://api.buycode.vn
FRONTEND_URL=https://buycode.vn
LOG_LEVEL=warning

CORS_ALLOWED_ORIGINS=https://buycode.vn,https://www.buycode.vn
SESSION_SECURE_COOKIE=true

CACHE_STORE=redis
SESSION_DRIVER=redis
QUEUE_CONNECTION=redis
REDIS_HOST=127.0.0.1
```

Nếu chưa cài Redis, có thể giữ `database`, nhưng Redis phù hợp hơn cho cache/session/queue production. Không dùng `array` hoặc `file` cho queue.

```bash
cd /var/www/buycodevn-api
composer install --no-dev --prefer-dist --optimize-autoloader
php artisan migrate --force
php artisan optimize
php artisan storage:link
```

Sau mỗi lần thay `.env` hoặc deploy code:

```bash
php artisan optimize:clear
php artisan optimize
php artisan queue:restart
```

Chạy queue bằng Supervisor, tối thiểu một worker:

```ini
[program:buycodevn-worker]
command=php /var/www/buycodevn-api/artisan queue:work --sleep=2 --tries=3 --timeout=120
directory=/var/www/buycodevn-api
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
user=www-data
redirect_stderr=true
stdout_logfile=/var/www/buycodevn-api/storage/logs/worker.log
```

Cron Laravel bắt buộc để chạy tác vụ hosting/VPS:

```cron
* * * * * cd /var/www/buycodevn-api && php artisan schedule:run >> /dev/null 2>&1
```

### PHP-FPM và OPcache

Giá trị khởi đầu phù hợp VPS nhỏ, cần điều chỉnh theo RAM và lưu lượng:

```ini
opcache.enable=1
opcache.memory_consumption=192
opcache.interned_strings_buffer=16
opcache.max_accelerated_files=20000
opcache.validate_timestamps=0
realpath_cache_size=4096K
realpath_cache_ttl=600
```

Với `opcache.validate_timestamps=0`, phải reload PHP-FPM sau mỗi lần deploy:

```bash
sudo systemctl reload php8.3-fpm
```

## 5. Triển khai trên hosting cPanel

Hosting phải hỗ trợ Node.js 22, chạy ứng dụng Node liên tục và reverse proxy domain vào ứng dụng. Nếu gói hosting chỉ hỗ trợ PHP thì không thể chạy đầy đủ Next.js SSR; khi đó cần đặt frontend trên VPS/Vercel và giữ Laravel trên hosting.

Quy trình với **Setup Node.js App**:

1. Build bằng đúng `.env.production`, tốt nhất build trên máy CI/Linux cùng phiên bản Node.
2. Upload nội dung `.next/standalone`, thư mục `.next/static` và `public` theo cấu trúc ở mục VPS.
3. Chọn startup file `server.js`, mode `Production`, biến `PORT` do cPanel cấp.
4. Khai báo `API_INTERNAL_URL`, `SERVER_API_TIMEOUT_MS` và `PUBLIC_DATA_REVALIDATE_SECONDS` trong giao diện Node App. `NEXT_PUBLIC_API_URL` phải đúng từ lúc build vì không thể đổi bundle đã tạo chỉ bằng restart.
5. Restart ứng dụng sau khi upload.

Nếu frontend và Laravel không có endpoint nội bộ trên hosting, đặt `API_INTERNAL_URL=https://api.buycode.vn/api`. URL HTTPS công khai sẽ chậm hơn loopback nhưng vẫn hoạt động.

Trong **MultiPHP INI Editor**, bật OPcache nếu nhà cung cấp cho phép. Với Laravel:

```bash
composer install --no-dev --prefer-dist --optimize-autoloader
php artisan optimize
```

Thiết lập cron cPanel mỗi phút:

```cron
* * * * * cd /home/USER/buycodevn-api && /usr/local/bin/php artisan schedule:run >> /dev/null 2>&1
```

Nếu hosting không cho Supervisor, thêm cron xử lý queue theo lô:

```cron
* * * * * cd /home/USER/buycodevn-api && /usr/local/bin/php artisan queue:work --stop-when-empty --tries=3 --timeout=120 >> /dev/null 2>&1
```

Thay `USER` và đường dẫn PHP bằng giá trị thật của hosting.

## 6. Kiểm tra sau triển khai

Đo ít nhất hai lần để phân biệt cold cache và warm cache:

```bash
curl -sS -o /dev/null -w 'HTTP=%{http_code} DNS=%{time_namelookup}s CONNECT=%{time_connect}s TTFB=%{time_starttransfer}s TOTAL=%{time_total}s\n' https://buycode.vn/
curl -sS -o /dev/null -w 'HTTP=%{http_code} TTFB=%{time_starttransfer}s TOTAL=%{time_total}s\n' https://buycode.vn/
curl -sS -o /dev/null -w 'HTTP=%{http_code} TTFB=%{time_starttransfer}s TOTAL=%{time_total}s\n' https://api.buycode.vn/api/v1/site-settings
```

Kiểm tra URL nội bộ ngay trên VPS:

```bash
curl -sS -o /dev/null -w 'HTTP=%{http_code} TTFB=%{time_starttransfer}s TOTAL=%{time_total}s\n' http://127.0.0.1:8080/api/v1/site-settings
```

Nếu URL nội bộ nhanh nhưng trang chủ vẫn chậm, kiểm tra `pm2 logs buycodevn-frontend`, log Nginx và RAM/CPU. Nếu chính API nội bộ chậm, dùng Laravel Telescope chỉ ở môi trường kiểm thử hoặc slow query log của MySQL để tìm query; không bật Telescope ghi toàn bộ request trên production lâu dài.

Mốc thực tế nên hướng tới sau khi cache đã ấm:

- TTFB trang chủ cùng khu vực máy chủ: dưới 500-800 ms.
- API cấu hình/menu: dưới 200-400 ms.
- Không còn request document dừng đúng 10 giây.
- Skeleton xuất hiện ngay khi API chưa trả dữ liệu và không làm thay đổi mạnh chiều cao bố cục.
