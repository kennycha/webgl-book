# 로컬환경 CORS

- Error message

  ```
  Access to image at 'file:///C:/Users/user200402/Desktop/webgl-book/5.1/wood_128x128.jpg' from origin 'null' has been blocked by CORS policy: Cross origin requests are only supported for protocol schemes: http, data, chrome, chrome-extension, chrome-untrusted, https.
  ```

- type을 module로 설정한 script 태그가 포함된 HTML 파일을 로컬에서 로드할 경우 자바스크립트 모듈 보안 요구사항으로 인해 CORS 오류가 발생

  - 로컬에서 로컬로, 같은 경로의 자원을 요청하는데 에러 메세지엔 보시다시피, 출처가 null 로 넘어온 script에 대한 접근이 CORS 정책에 따라 제한

  - 브라우저는 웹에서 로컬 파일에 접근하지 못하도록 출처를 null로 설정해주고, c:/경로/index.html에서 null/js/module.js로 리소스를 요청한 것이 되어 CORS에러가 발생

- http-server 를 통해 폴더를 서버에 올려서 해결