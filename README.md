# visitor-counter-example

## 개요

Cloudflare Workers를 이용해서 간단한 방문자 카운팅 API를 만드는 방법을 설명합니다.

자세한 내용은 [Cloudflare Workers로 서버리스 방문자 카운팅 API 만들기](https://blog.day1swhan.com/posts/cloudflare-workers-01) 포스팅을 참조하시기 바랍니다.

Workers에 대한 더 많은 정보는 [공식 문서](https://developers.cloudflare.com/workers/)를 참조하시기 바랍니다.

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
env.VISITOR_COUNT_DB (1234567890abcdef1234567890abcdef)      KV Namespace      local

⎔ Starting local server...
[wrangler:info] Ready on http://localhost:8787
```

```sh
curl 'http://localhost:8787/view?id=my-first-post'

{
  "postId": "my-first-post",
  "count": 1,
  "lastUpdate": "2025-07-14T09:10:36Z"
}
```

## 배포 준비

### 계정 API 토큰 발급

wrangler를 이용한 cli 환경에서 배포하기 위해서는 API 토큰 발급 후 환경변수에 등록해 줘야 합니다.

[Dashboard](https://dash.cloudflare.com/)에서 계정 관리 - 계정 API 토큰 - 사용자 설정 토큰 생성

계정 단위에서 편집 권한을

- Workers KV 저장 공간
- Workers 스크립트

이렇게 두개 넣어주시면 됩니다.

```sh
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

workers가 배포 후 kv 저장소에 접근할 수 `wrangler.jsonc` 파일에 방금 생성된 kv_namespace `id` 값을 반영해 줍니다.

```json
// wrangler.jsonc
{
  "name": "visitor-counter-example",
  ...
  "kv_namespaces": [
    {
      "binding": "VISITOR_COUNT_DB",
      "id": "987654321abcdefg", // 프로덕션용, 배포시 포함되어야됨
      "preview_id": "1234567890abcdef1234567890abcdef" // 이건 로컬용, 아무 의미 없음
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
curl 'https://visitor-counter-example.MY-DOMAIN.workers.dev/view?id=my-first-post'

{
  "postId": "my-first-post",
  "count": 1,
  "lastUpdate": "2025-07-14T09:20:36Z"
}
```

## License

[MIT License](https://opensource.org/licenses/MIT)
