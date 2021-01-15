# Matzip-exe Server
![GitHub release (latest by date)](https://img.shields.io/github/v/release/matzip-exe/Server)
[![Build Status](https://travis-ci.com/matzip-exe/Server.svg?token=12ZCwuSzqn84fesyQH8n&branch=master)](https://travis-ci.com/matzip-exe/Server)
![GitHub last commit](https://img.shields.io/github/last-commit/matzip-exe/Server)

# 공인식당
서울시, 구 업무추진비 데이터를 기반으로 한 음식점 리스트🍱
<br>
![logo](https://raw.githubusercontent.com/matzip-exe/Client/master/app/src/main/res/mipmap-hdpi/icon_marker_foreground.png?token=AJHV7BVH5RFRJ4QPOZOUVXS7IXMTK)


**개발 프로젝트명: matzip-exe**
<br><br>

# 기술 스택

|Category| - |
| --- | --- |
|Language|Javascript|
|JS Runtime|Node.js|
|Web Framework|Express|
|Database|PostgreSQL|
|Test|Jest|
|Authentication|JWT|
|CI|Travis CI|


# 개발 의의
 * Node.js + Express 이용한 첫 번째 실서비스 개발.
 * MVC 아키텍쳐 패턴 적용.
 * JWT을 통한 클라이언트 인증.
 * Travis CI를 통해 빌드 & 테스트 자동화.
 * 클라우드 환경에서 개발(AWS EC2 + Cloud9)
 * Naver OpenAPI(검색/지역) + Naver Cloud Platform(Maps)
 * 업데이트 되지 않은 API문서의 의존성 문제 해결(request->axios)
 * 클라이언트 개발자와 소통 방식에 대해 고민(ex.통신 인터페이스 설계)

# 서버 구조

```
./bin
└── www (<-- starting point)

./src
├── app.js
├── config
│   ├── dbConnection.js
│   └── lists.js
├── dao
│   └── dao.js
├── middlewares
│   └── auth.js
├── models
│   ├── BusinessDetail.js
│   └── VisitRecord.js
├── routes
│   ├── errorHandlers.js
│   ├── managerRouter.js
│   ├── middlewares.js
│   └── userRouter.js
├── services
│   ├── authService.js
│   ├── manageService.js
│   └── userService.js
├── test
│   ├── api.local.test.js (hidden)
│   ├── api.test.js
│   └── auth.test.js
└── utils
    ├── crawler.js (hidden)
    ├── jwtUtils.js
    ├── logger.js
    ├── naverSearch.js
    └── utils.js
```
# Demo

[![Youtube](https://i.imgur.com/JZGjk9d.png)](https://www.youtube.com/watch?v=_N8Y6FO2HhQ)

# 스크린샷

![sc](https://lh3.googleusercontent.com/MKt5jujL8hj5nnkJUjLsliP9vYtyhuvQ9da-ybjMGSh20aX4oWdY1gEBB3dhcFPMf3A4=w720-h310-rw)
![sc](https://lh3.googleusercontent.com/FWoun1XCn3ywq_qwLIidXlel9cGbx4Gq3vNbonAB-Z7bvQIwA1b18TKn4UdIDbFixbI=w720-h310-rw)
![sc](https://lh3.googleusercontent.com/fTXLWBhgcbbwiugsj8XBS9_7rxL3Fk0xN1hhMi_MsNZUIFDrAd4TwS0_GuJfuSw4mQ=w720-h310-rw)
