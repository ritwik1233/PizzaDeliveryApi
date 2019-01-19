# PizzaDelivery API

This project demonstrate a restful api build using pure NodeJS.

## Prerequisites
* Stripe api key
* mailgun api key
* mailgun domain name

## Project Functionality
* User can create, read, update, delete user details.
* User can create, read, update, delete order cart details.
* User can create and delete token details.
* User can place order following which a payment is made using sandbox [stripe](https://stripe.com) api and finally a mail is sent to the user with  the billing details using the [mailgun](https://www.mailgun.com/) api.




## Menu Items

Below is the menu format of the application.The parameters passed as orders must be available in the below json array
```
[

{"Vegetarian Pizza": [
            { "small" : 100 },
            { "medium" : 200 },
            { "large" :  300 } ] },
{"Chicken Pizza": [
            { "small" : 150 },
            { "medium": 250 },
            { "large" : 350 }]},
{"Mutton Pizza": [
            { "small" : 200 },
            { "medium" : 300 },
            { "large" : 400 }]},
{"Prawn Pizza": [
            { "small" : 300},
            { "medium" : 400},
            { "large" : 500 } ]}
]

```

### User functionality
#### Create User
```
url=/users
method=post
header=none
parameters=
{
	"name":<Name>(String),
	"email":<email>(String),
	"password":<password>(String),
	"address":<address>(String),
	"cardType":<cardType>(String)
}
```
#### Delete User
```
url=/users?email=<email>
method=delete
header=token ID

```
#### Read User
```
url=/users?email=<email>
method=post
header=token ID
```
#### Update User
```
url=/users
method=put
header=token ID
parameters=
{
	"email":<email>,
	"orderID":<orderID>,
	"orderType":<orderType>('large','small','medium'),
	"Quantity":<Quantity Value>
}
```


### Token Functionality

#### Create Token
```
url=/tokens
method=post
parameters=
{
     "email":<email>,
     "password":<password>
}
```

#### Delete Token
```
url=/tokens?id=<token ID>
method =delete
```

### Order Functionality

#### Create Order
```
url=/order
method=post
header=token ID
parameters=
{
"email":<email>,
"orderItem":<Order Item>(['Vegetarian Pizza','Chicken Pizza','Mutton Pizza','Prawn Pizza']),
"orderType":<order Type>(['small','medium','large']),
"Quantity":<Quantity>
}
```
#### Delete Order
```
url=/order?email=<email>&&orderID<orderID>
method=delete
header=token ID
```
#### Update Order
```
url=/order
method=post
header=token ID
parameters={
	"email":<email>,
	"orderID":Order ID,
	"orderType":<order Type>(['small','medium','large']),
	"Quantity":<Quantity>
}
```
#### Read Order
```
url=/order?email=<email>
method=get
header=token ID
```

### Checkout Functionality
```
url=/checkout?email=<email>
method=get
header=token ID
```
### Empty Cart Functionality
```
url=/deleteAll?email=<email>
method=delete
header=tokenID

```
## Basic Application Flow
* Create a user using the create user functionality
* Create a token using user email and password.
* Use the token id in the token file as the header token for all other funcationalities

