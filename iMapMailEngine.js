/**
* Module dependencies.
*/

var app = module.exports = express.createServer();
// Configuration


app.configure(function () {
    app.set('views', __dirname + '/views');
    app.set('view options', {
        layout: false
    });
    app.set('view engine', 'jade');
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.cookieParser());
    app.use(express.session({
        secret: 'something'
    }));
    //app.use(app.router);
    app.use(express.static(__dirname + '/public'));
    app.use(connect.compress());
});

/*app.configure('development', function () {
app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});*/

/*app.configure('production', function () {
app.use(express.errorHandler());
});*/
app.get('*', function (req, res, next) {
    req.connection.setTimeout(exports.requestTimeOut);
    next();
});

app.post('*', function (req, res, next) {
    req.connection.setTimeout(exports.requestTimeOut);
    next();
});

var SendMail = require('./routes/sendMail.js')
, Commons = require('./routes/commonServer.js')
, commonSettings = require('./routes/commonSettings.js')
, Imap = require('imap')
, inspect = require('util').inspect
, fs = require('fs')
;



app.listen(commonSettings.iMapEmailPort, function () {
    startEmailListner();
    console.log("iMap Engine is running on port %d in %s mode", app.address().port, app.settings.env);
});



//handles application-wide uncaught exception
process.on('uncaughtException', function (err) {
    Commons.handleException(err, undefined, undefined)
});

app.on('close', function () {
    console.log('close');
});

process.on('exit', function () {
    console.log('About to exit.');
});

//This function will read the emails and discard the emails, which we did not find the Reply-in string

function startEmailListner_body(number)
{  
    //Your string :PROJECTNAME-TI_4545_UI66-reply@domain.com
    var MailParser = require("mailparser").MailParser,
    mailparser = new MailParser();
    var mp = new MailParser({
        streamAttachments: true
    });
   
    var buffer = new Buffer(5 * 1000 * 1000);
    fs.readFile('../YOUR-PATH/list_emails/msg-'+number+'-body.txt', 'utf8', function (err,data) {
        if (err) {
            return console.log(err);
        }        
        var email = data;
        // setup an event listener when the parsing finishes
        mailparser.on("end", function(mail_object){
          //   console.log(mail_object);  
           // return false;
            // console.log(mail_object.attachments);
            if(mail_object.inReplyTo!=undefined)
            {
                var tovalue=  mail_object.to[0].name;
                var final_value_to=tovalue.split("@");
                var taskid=final_value_to[0].split("-");
                if(taskid[0].indexOf("TI")!=-1)
                {
                    var get_final_taskid=taskid[0].split("TI");
                    var final_task_id=get_final_taskid[1].split("UI");
                    var final_project_id=get_final_taskid[0].split("UI");
                    var final_user_id=get_final_taskid[1].split("UI");
                    var udpated_project_id=final_project_id[0].split("_");
                   
                    console.log("Project ID:",udpated_project_id[0]);
                    console.log("TASK ID:",final_task_id[0]);                    
                    console.log("User ID:",final_user_id[1]);  
                }
                var text_content=mail_object.text;
                var length_of_index=text_content.indexOf("Reply ABOVE THIS LINE to add a comment to this");
                if(length_of_index!=-1)
                {    
                	var finalstring=text_content.toString().substr(0,length_of_index);
                	var zimbra_reply_checking=finalstring.indexOf("----- Original Message -----");
                	if(zimbra_reply_checking >0)
                	{
                 		var finalstring= finalstring.toString().substr(0,zimbra_reply_checking);
                 		console.log("Store this string as reply message:",finalstring);
                	}
                	else
                	{    
                		var remove_unncessary_part=finalstring.indexOf("> wrote:");
                		var wrote_tring=finalstring.toString().substr(0,remove_unncessary_part);
                		var on_key_search=wrote_tring.lastIndexOf("On");
                		var modified_text_with_unnessarydata=wrote_tring.toString().substr(0,on_key_search);
                		var finalstring= modified_text_with_unnessarydata;
                		console.log("Store this string as reply message:",modified_text_with_unnessarydata);
                	}
                
                	if(mail_object.attachments!=undefined)
                	{
                    	for(var i=0; i<mail_object.attachments.length; i++){

                        	console.log("File size:",mail_object.attachments[i].length);
                        	var filename='NoName' + '-' + new Date() + Math.random() + '_'+mail_object.attachments[i].fileName;
                        	var store_content=mail_object.attachments[i].content;
                        	console.log("Original FileName:",mail_object.attachments[i].fileName);
                        	console.log("Modified FileName:",filename);
                        	console.log("File size:",mail_object.attachments[i].length);
                        	
                        	//create a new folder with task id name.
                        	fs.writeFile("list_emails/attachments/"+filename,store_content, function(err) {
                            if(err) {
                                console.log(err);
                            } else {
                            // console.log("The file was saved!");
                            }
                        }); 
                    }
                }  
            
            	//Write code for inserting these values in your database
            
            	//after insertion remove the txt file
            	/*
                 fs.unlink('../YOUR-PATH/list_emails/msg-'+number+'-body.txt', function (err) {
                    if (err) throw err;
                    console.log('successfully deleted.');
                	})
            	*/
            	}
            	else
            	{
            		console.log("mail found without reply contents.");    
            	}   
            }
            else
            { 
            	//remove the unnecessary files;
                fs.unlink('../YOUR-PATH/list_emails/msg-'+number+'-body.txt', function (err) {
                    if (err) throw err;
                    console.log('successfully deleted.');
                })             
            } 
        });
        
        // send the email source to the parser
        mailparser.write(email);
        mailparser.end();
    });
}

function startEmailListner()
{
    var Imap = require('imap'),
    inspect = require('util').inspect;
    var MailParser = require("mailparser").MailParser;
    var imap = new Imap({
        user: 'youremail@gmail.com',//Listner email from where all incoming emails are listed.
        password: 'password',
        host: 'imap.gmail.com',
        port: 993,
        tls: true,
        tlsOptions: {
            rejectUnauthorized: false
        }
    }); 
    var fs = require('fs'), fileStream;
    function openInbox(cb) {
        imap.openBox('INBOX', false, cb);
    }
    
    imap.once('ready', function() {
        openInbox(function(err, box) {
            if (err) throw err;
            
            // Read only Seen emails.
            imap.search([ 'SEEN', ['SINCE', 'December 25, 2013'] ], function(err, results) {
                if (err){
                    console.log('you are already up to date');
                }
                var f = imap.fetch(results, {
                    bodies: ''
                });
                f.on('message', function(msg, seqno) {
                    
                    console.log(msg);
                    var prefix = '(#' + seqno + ') ';
                    msg.on('body', function(stream, info) {
                        //store the messages in one txt file.
                        stream.pipe(fs.createWriteStream('list_emails/msg-' + seqno + '-body.txt'));
                    });
                    msg.once('attributes', function(attrs) {
                        });
                    msg.once('end', function() {
                         console.log(prefix + 'Finished');
                         //check which emails are required or not. For that need to use this function by passing the sequence number of message.
                        startEmailListner_body(seqno);
                    });
                });
                f.once('error', function(err) {
                    console.log('Fetch error: ' + err);
                });
                f.once('end', function() {
                    // console.log('Done fetching all messages!');
                    });
                    
                //update the flag with Seen.    
                imap.addFlags(results, 'Seen', function(err) { });
            });
        });
    });
    imap.connect();
}
