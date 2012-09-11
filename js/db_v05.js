
function removeChildNodes(id){      
  // Removing all children from an element
  console.warn('Entry removed', id); //
  var element = document.getElementById(id);      
  while (element.firstChild !== null) {
    element.removeChild(element.firstChild);
  }
}// removeChildNodes_


var idxDB = (function() {
    var idb_;
    var editEntryKey =0;
    var idbRequest_;
    var idbLog_ = document.getElementById('idb-log');
    var idResultsWrapper_ = document.getElementById('idb-results-wrapper');

    // IndexedDB spec is still evolving, various browsers keep it
    // behind various flags and implementation varies.
    if ('webkitIndexedDB' in window) {
      window.indexedDB = window.webkitIndexedDB;
      window.IDBTransaction = window.webkitIDBTransaction;
    } else if ('mozIndexedDB' in window) {
      window.indexedDB = window.mozIndexedDB;
    }

    // Open our IndexedDB if the browser supports it.
    if (window.indexedDB) {
      idbRequest_ = window.indexedDB.open("Test2", "A test object store.");
      idbRequest_.onerror = idbError_;
      idbRequest_.addEventListener('success', function(e) {
        idb_ = idbRequest_.result || e.result;  // FF4 requires e.result. IDBRequest.request isn't set :(
        loadAllEntries_(e);
      }, false);
    }


    function idbRemove_() {
      if (!idb_) {
        if (idbRequest_) {
          idbRequest_.addEventListener('success', idb_.removeObjectStore, false); // If indexedDB is still opening, just queue this up.
        }
      return;
      }
    } // idbRemove_

    function idbCreate_() {
      if (!idb_) {
        if (idbRequest_) {
          // If indexedDB is still opening, just queue this up.
          idbRequest_.addEventListener('success', idb_.removeObjectStore, false); 
        }
        return;
      } // idb_ still opening

      var request = idb_.setVersion('the new version string');
      request.onerror = idbError_;
      request.onsuccess = function(e) {
        if (!idb_.objectStoreNames.contains('myObjectStore')) {
          try {                        
            
            var config = null; // does not work in chrome --> { keyPath:'id', autoIncrement: false};
            var objectStore = idb_.createObjectStore('myObjectStore', config); // FF is requiring the 2nd keyPath arg. It can be optional :( 
            console.warn("Object store created.");
          } catch (err) {
            console.error('error', err.toString());
          }
        } else {
          console.error('Object store already exists.');
        }
      }
    }

    function idbRemove_() {
      if (!idb_) {
        if (idbRequest_) {
          idbRequest_.addEventListener('success', idb_.removeObjectStore, false); // If indexedDB is still opening, just queue this up.
        }
        return;
      } // !idb_
      var request = idb_.setVersion("the new version string");
      request.onerror = idbError_;
      request.onsuccess = function(e) {
        if (idb_.objectStoreNames.contains('myObjectStore')) {
          try {
            // Spec has been updated to deleteObjectStore.
            if (idb_.deleteObjectStore) {
              idb_.deleteObjectStore('myObjectStore');
            } else {
              idb_.removeObjectStore('myObjectStore');
            }
            console.warn('Object store removed.');
          } catch (err) {
            console.error('idbRemove_ --> error:', err.toString());            
          }
        } else {
            console.warn('Object store does not exist');
        }
      }; // onSuccess      
    }// idbRemove_

    function mozillaExample(){
      // Create an objectStore to hold information about our customers. We're
      // going to use "ssn" as our key path because it's guaranteed to be
      // unique.
      var objectStore = db.createObjectStore("customers", { keyPath: "ssn" });

      // Create an index to search customers by name. We may have duplicates
      // so we can't use a unique index.
      objectStore.createIndex("name", "name", { unique: false });

      // Create an index to search customers by email. We want to ensure that
      // no two customers have the same email, so use a unique index.
      objectStore.createIndex("email", "email", { unique: true });
    }


    function idbError_(e) {
      console.error('idbError_(e) --> Error: ', e.message,e.code);
    }

    function getEntryInput_(){
      var entry = {};      
      key = document.getElementById('idb-key').value;
      entry.id = (key.length > 3) ? key : new Date().getTime();
      entry.title  =  document.getElementById('idb-title').value;
      entry.text =  document.getElementById('idb-text').value;
      console.log('entry:', entry);
      return entry;
    }

    // idxDB.loadEntry(1347394752378);
    function loadEntry_(key) {
      var transaction = idb_.transaction(["myObjectStore"], "readonly"); // Create a transaction that locks the world.
      var objectStore = transaction.objectStore("myObjectStore");
      var request = objectStore.get(key);
      request.onerror = idbError_;
      request.onsuccess = function(e) {
        var value = e.result || this.result;  // FF4 requires e.result. IDBRequest.request isn't set :(;
        console.log('editEntry_ --> value', value);
      };
    }// editEntry 

    // read all rows from database
    function loadAllEntries_(e){
      if (!idb_.objectStoreNames.contains('myObjectStore')) {
            console.warn("Object store not yet created.");
            idbCreate_();
        return;
      } // (!myObjectStore)      
      var transaction = idb_.transaction(['myObjectStore'], "readonly");          
      var request = transaction.objectStore('myObjectStore').openCursor(); // Get all results.      
      var dbRows =[];
      request.onsuccess = function(e) {        
        var cursor = request.result || e.result;  // FF4 requires e.result. IDBRequest.request isn't set :(        
        if (!cursor) {                  
          writeRows(dbRows);
          return;
        } // all rows were read
        dbRows.push(cursor.value);        
        cursor.continue();      
      }// request.onsuccess      
    }// loadAllEntries


    function editEntry_(key) {          
      var transaction = idb_.transaction(["myObjectStore"], "readonly"); // Create a transaction that locks the world.
      var objectStore = transaction.objectStore("myObjectStore");
      var request = objectStore.get(key);
      request.onerror = idbError_;
      request.onsuccess = function(e) {
        var value = e.result || this.result;  // FF4 requires e.result. IDBRequest.request isn't set :(;
        // console.log('editEntry_ --> value', value);
        document.getElementById('idb-key').value = value.id;
        document.getElementById('idb-title').value = value.title;
        document.getElementById('idb-text').value = value.text;
        idxDB.editEntryKey  = id;      
      };
    }// editEntry

    function saveEntry_() {
      if (!idb_) {
        if (idbRequest_) {
          // If indexedDB is still opening, just queue this up.
          idbRequest_.addEventListener('success', idb_.removeObjectStore, false); 
        }
        return;
      } // !idb_

      if (!idb_.objectStoreNames.contains('myObjectStore')) {
        console.error("Object store doesn't exist.");
        return;
      }

      // Create a transaction that locks the world.
      var objectStore = idb_.transaction(["myObjectStore"], "readwrite").objectStore("myObjectStore");
      console.log('objectStore', objectStore);
      var entry = getEntryInput_();
      if(idxDB.editEntryKey  === entry.id){
        idxDB.editEntryKey =0;
        deleteEntry_(id);
      }      
      entry.id = new Date().getTime();
      var request = objectStore.add(entry,  entry.id);                    
      console.log('request',request);
      request.onerror = idbError_;
      request.onsuccess = loadAllEntries_;
    } // saveEntry



    function deleteEntry_(id){      
      // var transaction = idb_
      //      .transaction(["myObjectStore"],"readwrite")
      //      .objectStore("myObjectStore")
      //      .delete(key); // Create a transaction that locks the world.
      var transaction = idb_.transaction(["myObjectStore"], "readwrite");            
      var objectStore = transaction.objectStore("myObjectStore");
      if (objectStore.delete) {
        var request = objectStore.delete(id);
      } else {
        var request = objectStore.remove(id);  // FF4 not up to spect
      }
      request.onerror = idbError_;
      request.onsuccess = removeChildNodes(id);
    }// deleteEntry    


  return {
    idbRemove: idbRemove_,
    loadAllEntries: loadAllEntries_,
    loadEntry: loadEntry_,
    editEntry: editEntry_,    
    saveEntry: saveEntry_,
    deleteEntry: deleteEntry_
  }
})();


var forEach = function(array, fn) {
    for (var i = 0; i < array.length; i++)
      fn(array[i]);
}   

function rowTemplate(entries){
  var dbRow = "";  
  for(var i = 0; i < entries.length; i++){
    dbRow += '<div id="'+ entries[i].id + '">';
    dbRow += '<h3>' + entries[i].title + '</h3>';
    dbRow += '<div>'+ entries[i].text;
    dbRow += '<a href="javascript:void(0)" ';
    dbRow += ' title="edit Entry: '+ entries[i].id +'"';
    dbRow += ' onclick="idxDB.editEntry('+ entries[i].id +')">[Edit]</a>';
    dbRow += '<a href="javascript:void(0)" ';
    dbRow += ' title="delete Entry: '+ entries[i].id +'"';
    dbRow += ' onclick="idxDB.deleteEntry('+ entries[i].id +')">[Delete]</a>';    
    dbRow += '</div></div>';
  }
  return dbRow;
}

function writeRows(dbRows){
  var outputPanel = document.getElementById("outputPanel");
  removeChildNodes(outputPanel.id);
  var newNode = document.createElement("div");
  newNode.innerHTML = rowTemplate(dbRows);
  outputPanel.appendChild(newNode);    
}