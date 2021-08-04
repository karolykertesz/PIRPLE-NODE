# NODE PIZZA INC.

## To start

```sh
cd pizza-api
node server.js

```

## The api endpoints:

| endpoint | methods             |
| -------- | ------------------- |
| users    | get,put,delete,post |
| login    | post                |
| logout   | delete              |
| shop     | get,post            |
| pay      | post                |

### users

- POST: creates new user /user did not logged in ,yet!!

  - data required: email address, min 6 character password, address,name

    - example: {
      "password" : "123456",
      "name": "John Smith",
      "email": "abc@hotmail.hotmail.com",
      "address": "Main Street 555"
      }

- DELETE: deletes excisting user / user needs to be logged in to perform delete!

  - data required: valid token needs to be stored in header,and id (user id)as querystring param

    - example: http://localhost:5000/users/?id=IO8UW1R8bw

-PUT: updates an excisting loged in user / user needs to be logged in to perform put request!

    - data required:valid token stored in header and at least one of the following item(name,password,email,address)

       - example: {

"password" : "123456eee",
"name": "Cate Winslet",

      }

- GET: get user email,name ,address / user needs to be logged in to perform get

  - data required:valid token stored in header

### login

- POST:

  - data required: email and password / returns the token to be stored in header

    - example: {
      "password" : "123456eee",
      "email": "abs@hotmail.com",
      }

### logout

-DELETE: deletes the excisting token / user needs to be logged in to perform delete

     - data required: only valid token stored in header

### shop

-GET: user gets the menu stored on the disc / user needs to be logged in to perform get

    - data required: only valid token stored in header

-POST: after the request the response returns a coupon id!

    - data required:  valid token stored in header, json object with id and quantity

      -example {"3": 6,"4": 7}       // id : 3 and quantity: 6,id : 4 and quantity: 7

### pay

-POST: after success email will be sent by mailgun and the response returns a templete recipe

    - data required: valid token stored in header, and coupon sent be shop

      -example {"coupon": "vi9W3RqvRR"}
