This is a shopping cart project built to practice NodeJS along with Express and 
MongoDB (Moongose). I used Handlebars as the Template Engine.

Currently it lets you add items to the shopping cart, it handles authentification 
with passport and session. The authentification has two methods, a local one
with a sign up with email and password and one using facebook authetication API.
It also lets you handle payments with Stripe.

Currently only an admin can add products to the cart, every user has a 'user' 
role when creating an account, the only admin is the one that registers 
'admin@mail.com' as the email. This admin user will be able to see the admin 
panel that will let you add products to sell. The users role is handled with 
connect-roles.