

(function(exports){

//var tools = require('./js/common_tools.js');
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var ObjectId = require('mongodb').ObjectID;
var url = 'mongodb://localhost:27017/test';
var modeDebug = false;


// Retourne une date préformatée 00:00:00:00
 function readableTimeStamp(){
    var theDate = new Date();
    var h = theDate.getHours();
    var m = theDate.getMinutes();
    var s = theDate.getSeconds();
    var ms = theDate.getMilliseconds();
    return h+":"+m+":"+s+":"+ms;
    }   



exports.testPersistance = function () {
   if (modeDebug == true) console.log("@ persistance.testPersistance() acceded");
}

// ----- test de la connexion avec mongodb - OK
exports.testConnection = function () {
     if (modeDebug == true) console.log("@ persistance.testConnection() acceded");
    MongoClient.connect(url, function(err, db) {
        assert.equal(null, err);
        console.log("@ persistance.testConnection() > Connected correctly to server", url);
        db.close();
    });
}

// Opérations sur les databases ---------------------------------


// ok
exports.getCountDatabases = function (successCallback, failureCallback) {
    if (modeDebug == true) console.log("@ persistance.getCountDatabases() acceded");
    if (successCallback) {
          MongoClient.connect(url, function(err, db) {
          var adminDb = db.admin();
          adminDb.listDatabases(function(err, dbs) {
              assert.equal(null, err);
              assert.ok(dbs.databases.length > 0);
              var result = dbs.databases.length;
              db.close();
              successCallback(result);
            });
        });
    } else {
          console.log ("getCountDatabases.failureCallback")
    }
}

// OK
exports.getListDatabases = function (successCallback, failureCallback) {
  if (modeDebug == true) console.log("@ persistance.getListDatabases() acceded");
  if (successCallback) {
      MongoClient.connect(url, function(err, db) {
          var adminDb = db.admin();
          adminDb.listDatabases(function(err, dbs) {
              assert.equal(null, err);
              var result = dbs.databases;
              db.close();
              successCallback(result);
          });
      });
  } else {
        console.log ("getListDatabases.failureCallback")
  }
}

// Opérations sur les collections -----------------------------------------

// todo
exports.getCountCollections = function (successCallback, failureCallback) {
  if (modeDebug == true) console.log("@ persistance.getCountCollections() acceded");
  if (successCallback) {  
        // TODO
  } else {
        console.log ("getListCollections.failureCallback")
  }

}

// OK
exports.getListCollections = function (successCallback, failureCallback) {
  if (modeDebug == true) console.log("@ persistance.getListCollections() acceded");
  if (successCallback) {  
    MongoClient.connect(url, function(err, db) {
        assert.equal(null, err);
        db.listCollections().toArray(function(err, collInfos) {
            var result = collInfos
            db.close();
            successCallback(result);
        }); 
    });
  } else {
        console.log ("getListCollections.failureCallback")
  }

}

// OK
exports.getCollectionDocs = function (collectionName, successCallback, failureCallback) {
  if (modeDebug == true) console.log("@ persistance.getCollectionDocs("+collectionName+") acceded");
  if (successCallback) {  
    var result = {};
    var i = 0;
    MongoClient.connect(url, function(err, db) {
        assert.equal(null, err);
        var cursor = db.collection(collectionName).find( );
        cursor.each(function(err, doc) {
            assert.equal(err, null);
            if (doc != null) {
                i= i+1 ;
                //result.push(doc);
                result[i] = doc;
            } else {
              // console.log(result)
              successCallback(result);
              db.close();
            } 
        
        });
    // console.log(result)
    
    });
  } else {
        console.log ("getCollectionDocs.failureCallback")
  }

}


// Ok
exports.createCollection = function (collectionName, successCallback, failureCallback) {
  if (modeDebug == true) console.log("@ persistance.createCollection("+collectionName+") acceded");
  var result = {};
  if (successCallback) {
     
      MongoClient.connect(url, function(err, db) {
          assert.equal(null, err);
          db.createCollection(collectionName, function(err, collection){
              assert.equal(null, err);
              db.close();

                // On récupère la nouvelle liste des collections
                /*// comme résult de l'opération
                exports.getListCollections(function(result) {
                        successCallback(result);
                }); 
                /**/ 
                successCallback(collection);
          });
      }); 
   } else {
      failureCallback("fail")
      console.log ("createCollection("+collectionName+").failureCallback") 
   }
}


// OK
exports.dropCollection = function (collectionName, successCallback, failureCallback)  {
  if (modeDebug == true) console.log("@ persistance.dropCollection("+collectionName+") acceded");
  if (successCallback) {
      MongoClient.connect(url, function(err, db) {
          assert.equal(null, err);
          var collection = db.collection(collectionName);
          collection.drop(function(err, reply) {
            // db.collectionNames(function(err, replies) { 
            // BUG non documenté ds la doc mongoDB !!! Il faut remplacer collectionNames par collections
            db.collections(function(err, replies) {
              var found = false;
              replies.forEach(function(document) {
                if(document.name == collectionName) {
                  found = true;
                  return;
                }
              });
              assert.equal(false, found);
              db.close();
              // successCallback(reply); // renvoie un booléen
            });

          });

          // A la place du booléen, 
          // on envoie la nouvelle liste des collections
          // comme résultat de l'opération
          exports.getListCollections(function(result) {
                  successCallback(result);
          });
          /**/  


          //successCallback("sucess");
    });
  } else {
      failureCallback("fail")
       console.log ("dropCollection("+collectionName+").failureCallback")
  }  
}



// Ok
exports.renameCollection = function (collectionName, newNameCollection, successCallback, failureCallback) {
  if (modeDebug == true) console.log("@ persistance.renameCollection("+collectionName+") acceded");
 
  if (successCallback) {
     
      MongoClient.connect(url, function(err, db) {
          assert.equal(null, err);
          var collection1 = db.collection(collectionName);

          /*// Attemp to rename a collection to a number
          try {
            collection1.rename(5, function(err, collection) {});
          } catch(err) {
            assert.ok(err instanceof Error);
            assert.equal("collection name must be a String", err.message);
          }

          // Attemp to rename a collection to an empty string
          try {
            collection1.rename("", function(err, collection) {});
          } catch(err) {
            assert.ok(err instanceof Error);
            assert.equal("collection names cannot be empty", err.message);
          }

          // Attemp to rename a collection to an illegal name including the character $
          try {
            collection1.rename("te$t", function(err, collection) {});
          } catch(err) {
            assert.ok(err instanceof Error);
            assert.equal("collection names must not contain '$'", err.message);
          }

          // Attemp to rename a collection to an illegal name starting with the character .
          try {
            collection1.rename(".test", function(err, collection) {});
          } catch(err) {
            assert.ok(err instanceof Error);
            assert.equal("collection names must not start or end with '.'", err.message);
          }

          // Attemp to rename a collection to an illegal name ending with the character .
          try {
            collection1.rename("test.", function(err, collection) {});
          } catch(err) {
            assert.ok(err instanceof Error);
            assert.equal("collection names must not start or end with '.'", err.message);
          }

          // Attemp to rename a collection to an illegal name with an empty middle name
          try {
            collection1.rename("tes..t", function(err, collection) {});
          } catch(err) {
            assert.equal("collection names cannot be empty", err.message);
          }
          /**/

          // Avec le nom en paramètre...
          try {
            collection1.rename(newNameCollection, function(err, collection) {
              // console.log("XXXXXXXXXXXX")
              // console.log(collection);
              successCallback(collection); 
              // collection == null si le nouveau nom existe déjà
              // ou si la collection à renommer n'existe pas..
            });
          } catch(err) {
            assert.equal("new collection name error: ", err.message);
          }





      }); 
   } else {
      failureCallback("fail")
      console.log ("renameCollection("+collectionName+").failureCallback") 
   }
}


// Crud des documents -------------------------------------------------------


// Ok
exports.insertOneDoc = function (collectionName, doc, successCallback, failureCallback) {
  if (modeDebug == true) console.log("@ persistance.insertOneDoc("+collectionName+",doc) acceded");
  if (successCallback) {
      //var result = false;
      MongoClient.connect(url, function(err, db) {
          assert.equal(null, err);
           db.collection(collectionName).insertOne(doc, function(err, result) {
                assert.equal(err, null);
                db.close();
                //console.log(result.ops); // L'Objet dans un tableau d'objets
                //console.log(result.ops[0]); // L'objet extrait de son tableau d'objets...
                //console.log("insertedCount:"+result.insertedCount); // Le nombre d'objets insérés ??
                //console.log("insertedId:"+result.insertedId); // L'ID de l'objet attribuée par MongoDB
                // On retourne l'objet inséré brut
                //var resultat = []
                //var result = result.ops[0]
                successCallback(result);   
           });
        }); 
   } else {
      console.log ("insertOneDoc("+collectionName+").failureCallback") 
   }
}




// Ok
exports.insertManyDocs = function (collectionName, arrayDocs, successCallback, failureCallback) {
  if (modeDebug == true) console.log("@ persistance.insertManyDocs("+collectionName+",arrayDocs) acceded");
  if (successCallback) {
      //var result = false;
      var count = arrayDocs.length;
      MongoClient.connect(url, function(err, db) {
          assert.equal(null, err);
           db.collection(collectionName).insert(arrayDocs, function(err, result) {
                assert.equal(err, null);
                db.close();
                successCallback(result); 
           });
        });
 
   } else {
      console.log ("insertManyDoc("+collectionName+").failureCallback") 
   }
}






// Ok
exports.deleteOnedDoc = function (collectionName, doc, successCallback, failureCallback) {
  if (modeDebug == true) console.log("@ persistance.deleteOnedDoc("+collectionName+",doc) acceded");
  if (successCallback) {
      //var result = false;
      //console.log(doc[0]._id)
      console.log(doc)
      MongoClient.connect(url, function(err, db) {
          assert.equal(null, err);
           db.collection(collectionName).deleteOne({_id: doc._id}, function(err, result) {
                assert.equal(err, null);
                db.close();
                // console.log(result)
                successCallback(result);   
           });
        }); 
   } else {
      console.log ("deleteOnedDoc("+collectionName+").failureCallback") 
   }
}



// Ok
exports.deleteManyDocs = function (collectionName, query, successCallback, failureCallback) {
  if (modeDebug == true) console.log("@ persistance.deleManyDocs("+collectionName+",doc) acceded");
  if (successCallback) {
      MongoClient.connect(url, function(err, db) {
          assert.equal(null, err);
           db.collection(collectionName).deleteMany(query, function(err, result) {
                assert.equal(err, null);
                db.close();
                successCallback(result);   
           });
        }); 
   } else {
      console.log ("insertOneDoc("+collectionName+").failureCallback") 
   }
}



// ok
exports.findOneDoc = function (collectionName, query, successCallback, failureCallback) {
  if (modeDebug == true) console.log("@ persistance.findOneDoc("+collectionName+") acceded");
  if (successCallback) {  
    MongoClient.connect(url, function(err, db) {
        assert.equal(null, err);
        var cursor = db.collection(collectionName).find(query);
        cursor.each(function(err, doc) {
            assert.equal(err, null);
            if (doc != null) {
                successCallback(doc);
            } else {
              db.close();
            } 
        
        });
    });
  } else {
        console.log ("getCollectionDocs.failureCallback")
  }

}


// ok
exports.findManyDocs = function (collectionName, query, successCallback, failureCallback) {
  if (modeDebug == true) console.log("@ persistance.findManyDocs("+collectionName+") acceded");
  if (successCallback) {  
    var result = {};
    var i = 0;
    MongoClient.connect(url, function(err, db) {
        assert.equal(null, err);
        var cursor = db.collection(collectionName).find(query);
        
        cursor.each(function(err, doc) {
            assert.equal(err, null);
            if (doc != null) {
                i= i+1 ;
                result[i] = doc; 

            } else {
              successCallback(result);
              db.close();
            } 
        });
    });
  } else {
        console.log ("getCollectionDocs.failureCallback")
  }

}



// OK
// Query 1 = requête indiquant le doc a modifier
// Query 2=  
exports.updateOneDoc = function (collectionName, query1,query2, successCallback, failureCallback) {
   if (modeDebug == true) console.log("@ persistance.updateOneDoc("+collectionName+",doc) acceded");
    if (successCallback) {
      MongoClient.connect(url, function(err, db) {
          assert.equal(null, err); 
          db.collection(collectionName).updateOne( query1,{ $set: query2 }, function(err, result) { 
                assert.equal(err, null);
                db.close();
                successCallback(result);   
           });
        }); 
   } else {
      console.log ("updateOneDoc("+collectionName+").failureCallback") 
   }

}


exports.replaceOneDoc = function (collectionName,docID,newDoc, successCallback, failureCallback) {
   // if (modeDebug == true) 
   console.log("@ persistance.replaceOneDoc("+collectionName+",doc) acceded");
    if (successCallback) {
      MongoClient.connect(url, function(err, db) {
          assert.equal(null, err); 
          db.collection(collectionName).replaceOne(docID,newDoc, function(err, result) { 
                assert.equal(err, null);
                db.close();
                successCallback(result);   
           });
        }); 
   } else {
      console.log ("updateOneDoc("+collectionName+").failureCallback") 
   }

}
/**/


//  ????
exports.updateManyDocs = function (collectionName, query1,query2, successCallback, failureCallback) {
   if (modeDebug == true) console.log("@ persistance.updateManyDocs("+collectionName+",doc) acceded");
    if (successCallback) {
      MongoClient.connect(url, function(err, db) {
          assert.equal(null, err); 
          db.collection(collectionName).updateOne( query1,{ $set: query2 }, function(err, result) { 
                assert.equal(err, null);
                db.close();
                successCallback(result);   
           });
        }); 
   } else {
      console.log ("updateOneDoc("+collectionName+").failureCallback") 
   }

}


// Ok
exports.removeAllDocs = function (collectionName, successCallback, failureCallback) {
  if (modeDebug == true) console.log("@ persistance.removeAllDocs("+collectionName+") acceded");
  if (successCallback) {
      MongoClient.connect(url, function(err, db) {
          assert.equal(null, err);
          db.collection(collectionName).remove({},function(err,result){
              // count = numberRemoved;
              db.close();
              // console.log(result)
              successCallback(result);
         });
      }); 
   
   } else {
      console.log ("removeAllDocs("+collectionName+").failureCallback") 
   }
   /**/
}


// ------------------------------------------------------------------


exports.deleteAllCollectionDocsOLD = function (collectionName) {
  if (modeDebug == true) console.log("@ persistance.deleteAllCollectionDocs("+collectionName+") acceded");
  MongoClient.connect(url, function(err, db) {
      assert.equal(null, err);
    db.collection(collectionName).remove({},function(err,numberRemoved){
          console.log("@ deleteAllCollectionDocs("+collectionName+") >> inside remove call back" + numberRemoved);
          console.log("----------------------");
        db.close();
      });
  });   
}



function temp () {

}


// Opérations sur les docs (C.R.U.D de base)------------------------------------------------


// Create.r.u.d
function insertDoc (db,doc,collectionName,callback) {
  db.collection(collectionName).insertOne(doc, function(err, result) {
    assert.equal(err, null);
    console.log(" @ insertDoc()");
    console.log("Inserted a document into the "+collectionName+" collection.");
    console.log("----------------------");
    callback(result);
  });
};

// c.Read.u.d
function getDoc (db,doc,collectionName,callback) {

  // Todo
};

// c.r.Update.d
function updateDoc (db,doc,collectionName,callback) {

  // Todo
};

// c.r.u.Delete
function deleteDoc (db,doc,collectionName,callback) {

  // Todo
};


})(typeof exports === 'undefined'? this['persistance']={}: exports);