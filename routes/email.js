module.exports = function(config){
	 var express = require('express');
	 var router = express.Router();
var mail = require('nodemailer').mail;


router.get('/',function(req,res){
/*var transporter = nodemailer.createTransport("SMTP",{
	service	:	'Gmail',
	auth	:	{
					user	:	'bharatmopuru@gmail.com',
					pass	:	'bachi406'
	}
});
var mailoptions	=	{
		from	:	'Bharat Mopuru<a-bhreddy@expedia.com>',
		to		:	'a-bhreddy@expedia.com',
		subject	:	'statistics',
		text	:	'Testing',
		html	:	'<b>Testing with node js</b>'
};

transporter.sendMail(mailoptions,function(err,info){
	if(err){
		console.log(err);
	}
	else{
		console.log('Message Sent :'+info.response);
	}
});*/
mail({
	from:'Ram Banda <brbd@hotmail.com>',
	to:'brbd@hotmail.com',
	subject:'Testing Url',
	text:'Testing Node js email',
	html:'<b>This is my first node.js email</b>'
});
res.send('Email sent successfully');
});
return router;
};