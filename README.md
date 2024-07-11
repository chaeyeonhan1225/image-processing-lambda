# image-processing-lambda
Lambda@Edge + Typescript 기반의 이미지 프로세싱 람다입니다.
sharp 라이브러리는 로컬에서 m1 mac으로 실행하는 경우 버전을 낮춰서 설치하는 것을 권장합니다.

- [Lambda@Edge + Typscript로 이미지 리사이징 적용하기](https://gkscode.tistory.com/90)

## 설정
- 이벤트
    ```yaml
    functions:
      imageProcessingHandler:
        name: image-processing-lambda-edge-${sls:stage}
        handler: handler.imageProcessingHandler
        events:
          - preExistingCloudFront:
              distributionId: ${file(./config.${opt:stage, 'dev'}.json):CF_DISTRIBUTION_ID}
              eventType: origin-response
              pathPattern: '*'
              includeBody: false 
              stage: ${sls:stage}
    ```
## 배포방법
1. aws configuration 설정
2. serverless 전역 설치
    ```bash
    npm i -g serverless
    ```
3. deploy 명령어로 배포
    ```bash
    serverless deploy --stage=dev
    ```
## 설정파일
config.dev.json
```json
{
    "CF_DISTRIBUTION_ID": <CLOUDFRONT distribution id>
}
```