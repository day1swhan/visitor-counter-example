# visitor-counter-example

![Cover image for visitor-counter-example](./public/cover.webp)

## 개요

Cloudflare Workers를 이용해서 간단한 방문자 카운팅 API를 만드는 방법을 설명합니다.

자세한 내용은 아래 포스팅들을 참조하시기 바랍니다.

- [Cloudflare Workers로 서버리스 방문자 카운팅 API 만들기 (1/2)](https://blog.day1swhan.com/posts/cloudflare-workers-01)
- [Cloudflare Workers로 서버리스 방문자 카운팅 API 만들기 (2/2)](https://blog.day1swhan.com/posts/cloudflare-workers-02)

Workers에 대한 더 많은 정보는 [공식 문서](https://developers.cloudflare.com/workers/)에서 확인하실 수 있습니다.

## 설치

```sh
git clone https://github.com/day1swhan/visitor-counter-example.git

cd visitor-counter-example && npm install && npm run types
```

## 개발 모드

```sh
npm run dev

Your Worker has access to the following bindings:
Binding                                                      Resource          Mode
env.VISITOR_COUNT_DB (1234567890abcdef)      KV Namespace      local

⎔ Starting local server...
[wrangler:info] Ready on http://localhost:8787
```

### 카운팅 정보 업데이트

```sh
curl -X POST \
-H 'Origin: http://localhost:3000' \
-H 'Content-type: application/json' \
-d '{"postId":"my-first-post"}' \
'http://localhost:8787/count'
```

```sh
HTTP/1.1 200 OK

...
Content-Length: 11
Content-Type: application/json
Access-Control-Allow-Origin: http://localhost:3000
Vary: Origin
Access-Control-Allow-Credentials: true
Access-Control-Allow-Headers: Content-Type
Access-Control-Allow-Methods: GET, POST, OPTIONS
Access-Control-Max-Age: 60
Set-Cookie: sid=xxxxxxxx; Domain=localhost; Path=/; HttpOnly; Max-Age=86400; SameSite=Strict;

{"ok":true}
```

### 카운팅 정보 가져오기

```sh
curl \
-H 'Origin: http://localhost:3000' \
'http://localhost:8787/view?id=my-first-post'

{
  "postId": "my-first-post",
  "count": 1,
  "lastUpdate": "2025-07-21T09:10:00Z"
}
```

## 배포 준비

### 계정 API 토큰 발급

wrangler를 이용한 cli 환경에서 배포하기 위해서는 API 토큰 발급 후 환경변수에 등록해 줘야 합니다.

[Dashboard](https://dash.cloudflare.com/)에서 계정 관리 - 계정 API 토큰 - 사용자 설정 토큰 생성

계정 단위에서 편집 권한을

- **Workers KV 저장 공간**
- **Workers 스크립트**

이렇게 두개 넣어주시면 됩니다.

```sh
# wrangler에서 사용할 환경변수 등록
export CLOUDFLARE_API_TOKEN="xxxxxxxxxx"
```

### KV Namespace 생성

Worker가 배포될 때 Key-Value 스토어를 자동으로 생성해 주지 않으니, 직접 wrangler 이용해서 생성해 주셔야 합니다.

```sh
npx wrangler kv namespace create VISITOR_COUNT_DB
```

```sh
Resource location: remote
🌀 Creating namespace with title "VISITOR_COUNT_DB"

...

✨ Success!
Add the following to your configuration file in your kv_namespaces array:
{
  "kv_namespaces": [
    {
      "binding": "VISITOR_COUNT_DB",
      "id": "987654321abcdefg" // 프로덕션용
    }
  ]
}
```

### KV Namespace 적용

배포된 worker가 KV 저장소에 접근할 수 `wrangler.jsonc` 파일에 방금 생성된 kv_namespace `id` 값을 반영해 줍니다.

```json
// wrangler.jsonc
{
  "name": "visitor-counter-example",
  ...
  "kv_namespaces": [
    {
      "binding": "VISITOR_COUNT_DB",
      "id": "987654321abcdefg", // 프로덕션용, 배포시 포함되어야됨
      "preview_id": "1234567890abcdef" // 이건 로컬용, 아무 의미 없음
    }
  ]
}
```

### Custom Domains 적용

worker가 개인 소유 도메인과 연결될 수 있도록 `wrangler.jsonc` 파일에 `routes` 옵션 추가해 줍니다.

```json
// wrangler.jsonc
{
  "name": "visitor-counter-example",
  ...
  "routes": [
    {
      "pattern": "visitor.my-domain.com",
      "custom_domain": true
    }
  ]
}
```

## 배포

이제 모든 준비가 끝났으니 workers를 배포해 보겠습니다.

```sh
npm run deploy
```

```sh
Total Upload: 2.93 KiB / gzip: 1.09 KiB
Your Worker has access to the following bindings:
Binding                            Resource
env.VISITOR_COUNT_DB (987654321abcdefg)      KV Namespace

...

Deployed visitor-counter-example triggers (0.41 sec)
  https://visitor.my-domain.com
```

### 카운팅 정보 업데이트

```sh
curl -X POST \
-H 'Origin: http://localhost:3000' \
-H 'Content-type: application/json' \
-d '{"postId":"my-first-post"}' \
'https://visitor.my-domain.com/count'
```

```sh
HTTP/2 200

...
server: cloudflare
content-type: application/json
content-length: 11
access-control-allow-origin: http://localhost:3000
access-control-allow-credentials: true
access-control-allow-headers: Content-Type
access-control-allow-methods: GET, POST, OPTIONS
access-control-max-age: 60
vary: Origin
set-cookie: sid=xxxxxxxx; Domain=visitor.my-domain.com; Path=/; HttpOnly; Max-Age=86400; SameSite=Strict;

{"ok":true}
```

### 카운팅 정보 가져오기

```sh
curl \
-H 'Origin: http://localhost:3000' \
'https://visitor.my-domain.com/view?id=my-first-post'

{
  "postId": "my-first-post",
  "count": 1,
  "lastUpdate": "2025-07-21T09:20:00Z"
}
```

## License

[MIT License](https://opensource.org/licenses/MIT)
