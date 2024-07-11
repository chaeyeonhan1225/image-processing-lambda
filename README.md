# image-processing-lambda
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