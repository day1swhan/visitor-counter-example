# visitor-counter-example

## 개요

Cloudflare Workers를 이용해서 간단한 방문자 카운팅 API를 만드는 방법을 설명합니다.

더 자세한 내용과 사용법은 [공식 문서](https://developers.cloudflare.com/workers/)를 참조하시기 바랍니다.

## 설치

```sh
git clone https://github.com/day1swhan/visitor-counter-example.git

npm install && npm run types
```

## 개발용 미리보기

```sh
npm run dev

Your Worker has access to the following bindings:
Binding                                                      Resource          Mode
env.VISITOR_COUNT_DB (1234567890abcdef1234567890abcdef)      KV Namespace      local

⎔ Starting local server...
[wrangler:info] Ready on http://localhost:8787
```

```sh
GET /view?id=my-first-post
Host: http://localhost:8787

{
  "postId": "my-first-post",
  "count": 1,
  "lastModified": "2025-07-14T09:10:36Z"
}
```

## 배포

### 계정 API 토큰 발급

wrangler를 이용한 cli 환경에서 배포하기 위해서는 API 토큰 발급 후 환경변수에 등록해줘야 합니다.

[cloudflare dashboard](https://dash.cloudflare.com/)에서 계정 관리 - 계정 API 토큰 - 토큰 생성

권한 적용 범위:

- 계정: Workers KV 저장 공간
- 계정: Workers 스크립트

```sh
export CLOUDFLARE_API_TOKEN="xxxxxxxxxx"
```

### KV Namespace 생성

배포 후 Workers가 방문자 카운팅 정보를 저장할 Key-Value 스토어를 생성합니다.

```sh
npx wrangler kv namespace create VISITOR_COUNT_DB

Resource location: remote
🌀 Creating namespace with title "VISITOR_COUNT_DB"

...

✨ Success!
Add the following to your configuration file in your kv_namespaces array:
{
  "kv_namespaces": [
    {
      "binding": "VISITOR_COUNT_DB",
      "id": "987654321abcdefg"
    }
  ]
}
```

### KV Namespace 적용

workers가 배포 후 kv 저장소에 접근할 수 `wrangler.jsonc` 파일에 방금 생성된 id 값을 반영해줍니다.

```sh
npm run deploy

Total Upload: 2.93 KiB / gzip: 1.09 KiB
Your Worker has access to the following bindings:
Binding                            Resource
env.VISITOR_COUNT_DB (xxxxxx)      KV Namespace

...

Deployed visitor-counter-example triggers (0.41 sec)
  https://visitor-counter-example.MY-DOMAIN.workers.dev
```

```sh
GET /view?id=my-first-post
Host: visitor-counter-example.MY-DOMAIN.workers.dev

{
  "postId": "my-first-post",
  "count": 1,
  "lastModified": "2025-07-14T09:20:36Z"
}
```

## License

[MIT License](https://opensource.org/licenses/MIT)
