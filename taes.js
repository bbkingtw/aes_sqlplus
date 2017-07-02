// Part of https://github.com/chris-rock/node-crypto-examples
var log=console.log
var _=require('lodash')
var chalk=require('chalk')
var bgRed=chalk.bgRed

var argv=require('optimist').argv

// Nodejs encryption with CTR
var crypto = require('crypto'),
    algorithm = 'aes256',
    def_password = argv.key||'1234567890123456';

var verbose=(argv.verbose=='true')||false
//log('def_password',def_password)

function encrypt(text,password){
	if (verbose) log('text',typeof text)
	if (verbose) log('before password',password,'def_password',def_password)
	password=password||def_password
	if (verbose) log('after password',password,'def_password',def_password)
  var cipher = crypto.createCipher(algorithm,password)
  var crypted = cipher.update(text,'utf8','hex')
  crypted += cipher.final('hex');
  return crypted;
}
 
function decrypt(text,password){
	password=password||def_password
  var decipher = crypto.createDecipher(algorithm,password)
  var dec = decipher.update(text,'hex','utf8')
  dec += decipher.final('utf8');
  return dec;
}

//crypto = require('crypto');
var db_record={}

function id_hash(id){
	var hash = crypto.createHash('md5').update(id).digest('hex');
	return hash
}

function dfile(s){
	return path.join(__dirname,s);
}

var fs=require('fs')
var path=require('path')

function append_record(id, password){
	if (verbose) log(id,'=>',password);
	var hash = id_hash(id);
	if (db_record[hash]) return log('id '+id+' exists already, please use update instead of');
	update_record(id,password);
/*
	if (verbose) log(bgRed('typeof passowrd', typeof(password)));
	var pass2=encrypt(password.toString(), key(hash))
 
	if(verbose) log('source==>', id, '/', password)
	if(verbose) log('target==>',hash, '/', pass2)
	db_record[hash]=pass2
	if(verbose) log('ready to write', db_record)

	var logger=fs.createWriteStream(dfile('db_record'))
	logger.write(JSON.stringify(db_record), function(err){
		logger.end()
	});
*/
}

function update_record(id, password){
	if (verbose) log(id,'=>',password);
	var hash = id_hash(id);

	if (verbose) log(bgRed('typeof passowrd', typeof(password)));
	var pass2=encrypt(password.toString(), key(hash))
 
	if(verbose) log('source==>', id, '/', password)
	if(verbose) log('target==>',hash, '/', pass2)
	db_record[hash]=pass2
	if(verbose) log('ready to write', db_record)

	var logger=fs.createWriteStream(dfile('db_record'))
	logger.write(JSON.stringify(db_record), function(err){
		logger.end()
	});
}

function browse_db(cb) {
	for (var hash in db_record) { 
		var hash_pass=db_record[hash]

		try{
			var original_pass=query_hash(hash)
			log('encrypted', hash, hash_pass, '==>', original_pass) 
		}
		catch(err){
			log('encrypted', hash, hash_pass, '==>', bgRed(err)) 
		}
	
	}
}

function load_db(cb) {
	var fname=dfile('db_record')

	if (!fs.existsSync(fname)) {
		log('db_record is not exist');
		return cb()
	}

	fs.readFile(fname, 'utf8', function (err,data) {
		if (err) {
			if (verbose) return console.log(err);
			cb(err)
		}
		else {
			if(verbose) log('data',data);
			db_record=JSON.parse(data)
			if (verbose) log(db_record);
			cb(null)
		}
	});
}

function main() {
	if (!(argv.key)) return print_usage();
	if (argv._.length==0) return print_usage();

	load_db(function(err){
		if (err) log(err);

		if(verbose) log('argv.length',argv._.length);

		var action=argv._[0].toLowerCase();
		if(verbose) log('action',action);

		switch(action){
			case 'append':
				if (argv._.length-1<2) return print_usage();
				append_record(argv._[1],argv._[2]);
				break;
			case 'update':
				if (argv._.length-1<2) return print_usage();
				update_record(argv._[1],argv._[2]);
				break;
			case 'query_id':
				if (argv._.length-1<1) return print_usage();
				query_id(argv._[1]);
				break;
			case 'browse_db':
				browse_db();
				break;
			case 'query_hash':
				if (argv._.length-1<1) return print_usage();
				query_hash(argv._[1]);
				break;
			default:
				print_usage();
				break;	
		}
	})
}

function print_usage(){
	log('usage:');
	log('	node taes.js append id pass --key=secret');
	log('	node taes.js update id pass --key=secret');
	log('	node taes.js query_id id --key=secret');
	log('	node taes.js browse_db --key=secret');
}

//append_record('mfgdev@mes14g1','mfgx86')
//append_record('mfgdev@mes14g2','f14min')
//log('db_record',db_record)

function key(hash) {
	hash=argv.key||hash
	if (verbose) log('hash',hash);
	var xx='bbkingtw'+hash
	if (verbose) log('xx',xx);
	return new Buffer(xx)
}

function query_id(id){
	var hash=id_hash(id)	
	var decrypted=query_hash(hash)

	if (verbose) log('password for',id,'actually is',decrypted)
	else log(decrypted)
	return decrypted
}

function query_hash(hash) {
	var encrypted=db_record[hash] 
	if (verbose) log('password for',hash,'decrypted to be',encrypted)
	var decrypted=decrypt(encrypted, key(hash))
	if (verbose) log('password for',hash,'actually is',decrypted)
	return decrypted
}

if (false){
	var hw = encrypt("hello world")
	log('encrypted',hw)
	console.log('decrypted',decrypt(hw));
}

main()
