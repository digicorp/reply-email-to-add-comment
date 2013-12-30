reply-to-add-comment
====================

Reply email to add comment on a post (Inspired from the similar feature of Basecamp)

## Required node.js Modules

- imap
- fs
- util
- mailparser

You can download all the modules from the https://npmjs.org

## Purpose of this functionality

Inspired from the "Reply-email-to-comment-on-post" feature of Basecamp, we did something similar in one of the products we are developing.

It is so much easier to reply the email to add a comment rather than signing in, finding the right post and adding a comment in a typical project management software.

## How does it work

In the reply-to email we will pass the encoded unique key string. This key will help us identify the thread/post/message on which the comment needs to be added.

for ex:
PROJECTNAME_8338_TI_76_UI_12224@domain.com => PROJECTNAME-TASKID_4545_USERID_66-reply@domain.com

## Process

First we need to read the incoming (reply-to) emails using the imap module. Get the required imap module from NPM.

After that refer to the file "iMapMailEngine.js".

The critical part of this feature is to identify which emails to consider because when we run the imap module, we will get all the emails. We just need "reply-to" emails by the users.

## Steps

<b>Get only SEEN (read) emails:</b>

for e.g. imap.search([ 'SEEN', ['SINCE', 'December 2, 2013'] ]

This will give you only those emails which are seen since 2nd Dec 2013.

Once the reading process completes use this:

imap.addFlags(results, 'Seen', function(err) { });

So in this step you get all the emails which are seen from 2nd Dec and run a loop for reading the email and setting the flag as 'Seen'. So that you don't read them (the emails with 'Seen' flag) again.

Now you should have only those emails, which either users have forwarded or replied.

<b>Now we should filter emails which are only replied and not others like forwarded etc.</b>

For that while reading an email you have to check for the "inReplyTo" object of the message part. We will also pass one sting in every email like "Reply ABOVE THIS LINE to add a comment to this" to double check.

Now remove the unnecessary values for e.g. headers etc., and get proper message content only.

We also need to handle the attachments. 

For that we will run a loop to find attachments in mail object and store them in one folder. In this case list_emails -> attachments.  

So now you have the content which is to be added as a comment and attachments. Just add them in your application's database and you are good to go.

Please contact us at info@digi-corp.com in case you have any questions.
