### common utils

```
file            exports               depends

common.js       CommonUtils
fe.js           FEUtils
utils.js        utils                 CommonUtils, FEUtils
xhr.js          xhrRequest            utils
net.js          net                   utils, xhrRequest
```