# assign-fy
Bot to find best assignee for a todo, based on heuristics and likelihood. Inspired from [Facebook Mention-Bot](https://github.com/facebook/mention-bot).

Status: Beta, Server returns the probablity values purely based on `heuristics`. `likelihood(user)` has not yet been considered.

### How to start server
```sh
git clone https://github.com/todofy/assign-fy.git
cd assign-fy
npm install
npm start
```

### How to test
Send a curl request like this: 
```sh
curl "http://127.0.0.1:9898/?repo=mebjas/CSRF-Protector-PHP&branch=master&file=libs/csrf/csrfprotector.php&line=388"
```

And response would be something like
```json
{
  "status":200,
  "error":false,
  "assignee":{
    "mebjas":0.9696943281832229,
    "mschwager":0.024468171279424536,
    "stephenlawrence":0.0058375005373524904
  }
}
```
