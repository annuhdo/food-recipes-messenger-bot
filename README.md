# ChopChop Food Recipes Bot
A chatbot that replies with a video recipe based on user's query

🍕 🍌 🍙 🍱

![](https://media.giphy.com/media/l4FGzZecuUtocXcnm/giphy.gif)

## Configuration
- This bot requires a _config.js_ file in the main directory. A demo config file has been included. Replace appropriate strings.
- This bot runs on NodeJS and Heroku
- Once all the configurations are in place, use `heroku create` to create the webapp, and make sure to follow the [FB guide](https://developers.facebook.com/docs/messenger-platform) to synchronize a Facebook page to the app 🍟.
- This bot relies on npm package Snoocore to connect to Reddit. 

## Frequently Asked Questions
###Why did you make this bot?
ChopChop was created to address some of user's concerns when it comes to looking for a recipe to make for the day:
- "There are too many options!"
- "I don't know what I want to make, but I have a general idea"
- "I don't want to click each Google search result and read a blog post about the cook's life before getting to the recipe part"
- "I usually just search for 'recipes with corn...'"

ChopChop tries to address these concerns by spitting out only one recipe based on your search result. The recipe will contain a title, a permalink to the actual recipe thread on Reddit, and a video showing how the recipe is cooked. This is to provide enough information so that users can quickly glance and decide whether they want to work with this recipe or click on _Another One._ 

By default, ChopChop curates a list of 20 results when a user searches for a recipe (prior analysis on 5 millenials showed that users tend to look through around 5-6 recipes before knowing what they want to make). 20 results also provide quicker callback result.

The reason why ChopChop was created as a chatbot rather than any other application is because it is made to appeal to millenials. In 2015, [59% of millenials cook with their smartphones or tablets handy](https://www.thinkwithgoogle.com/articles/cooking-trends-among-millennials.html) (article from Google, 'Cooking Trends Among Millenials: Welcome to the Digital Kitchen', 2015), and it was also found that [millenials freaking love cooking videos](https://www.thinkwithgoogle.com/articles/millennials-eat-up-youtube-food-videos.html) (according to Google, 'Millenials Eat Up Youtube Food Videos', 2014). ChopChop appeal to the target users by allowing them to watch recipe videos from their mobile devices and easily share with their friends by forwarding on the social media platform that they are using -- Facebook.

###Why is the bot so glitchy/slow/not replying
ChopChop lives on a Heroku server that sleeps for 6 hours a day. Therefore, ChopChop was probably sleeping when you messaged it. Contact me if you have a free solution other than Heroku.

## Further questions, Bugs, Support
Contact [Anna Ma](https://github.com/annuhma)

