var fs = require("fs");
var file = "edmdb.db";
var exists = fs.existsSync(file);

if(!exists) {
  console.log("Error database does not exist.");
}

//check if EXACT person exist by number
function checkPersonExist(number,ret,retf){
	var sqlite3 = require('sqlite3').verbose();
	var db = new sqlite3.Database(file);
	console.log("In checkPersonExist");
	db.serialize(function(){
		console.log("In checkPersonExist db.serialize");
		if(exists){
			db.each("select Name from CSREntry "+
					"where number='"+number+"'",
					function(err,row){
						ret(row.Name);
					},
					function(err,cntx){
						retf(cntx);
					});
		}

	});
	db.close();
}

function insertNewData(name,number,email,food,drink,others){
	console.log("In insertNewData");
	var sqlite3 = require('sqlite3').verbose();
	var db = new sqlite3.Database(file);
	db.serialize(function(){
		if(exists){
			var str = "INSERT INTO CSREntry (Name,Number,Email,Food1) VALUES (?,?,?,?);"
			var stmt = db.prepare(str);
			stmt.run(name,number,email,food); 
			stmt.finalize();
		}

	});
	db.close();
}


function updateData(name,number,email,food,drink,others){ 
	console.log("In updateData");
	var sqlite3 = require('sqlite3').verbose();
	var db = new sqlite3.Database(file);
	var entityid;
	var rsvp = require('rsvp');
	db.serialize(function(){
		if(exists){
			var str = "UPDATE CSREntry SET Name = ?, email=?, food1=? WHERE number=?"
			var stmt = db.prepare(str);
			stmt.run(name,email,food,number); 
			stmt.finalize();
		}

	});
	db.close();
}


module.exports = {checkPersonExist, insertNewData, updateData};
