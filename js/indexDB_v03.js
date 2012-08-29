      var idxDB = (function() {
        var idb_;
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
            idbShow_(e);
          }, false);
        }

        function idbError_(e) {
          idbLog_.innerHTML += '<p class="error">Error: ' +
                               e.message + ' (' + e.code + ')</p>';
        }

        function idbShow_(e) {
          if (!idb_.objectStoreNames.contains('myObjectStore')) {
            idbLog_.innerHTML = "<p>Object store not yet created.</p>";
            return;
          }
		  
		      var protOut = document.getElementById('prot-out');
          var html = [];
		      var prots = [];
          var transaction = idb_.transaction(['myObjectStore'], IDBTransaction.READ_ONLY); // Ready is default.
          var request = transaction.objectStore('myObjectStore').openCursor(); // Get all results.
          // This callback will continue to be called until we have no more results.
          request.onsuccess = function(e) {
            var cursor = request.result || e.result;  // FF4 requires e.result. IDBRequest.request isn't set :(
            if (!cursor) {
              idResultsWrapper_.innerHTML = '<ul class="record-list" id="idb-results">' + html.join('') + '</ul>';
			        protOut.innerHTML = prots.join('');
              return;
            }
            html.push('<li><span class="keyval" ',
                        ' contenteditable ',
                        ' onblur="idxDb.updateKey(\'',
                      cursor.key, '\', this)">', cursor.key, '</span> ',
                      '=> <span class="keyval" contenteditable onblur="idxDb.updateValue(\'',
                      cursor.key, '\', this)">', cursor.value.title, ' ' + cursor.value.text, '</span>&nbsp; ',
                      '<a href="javascript:void(0)" onclick="idxDb.deleteKey(\'',
                      cursor.key, '\')">[Delete]</a></li>');
			      prots.push('<h3>', cursor.value.title, '</h3> <div>', cursor.value.text,  '<hr />',
                '<a href="javascript:void(0)" onclick="idxDB.editEntry(\'', cursor.key, '\')">[Edit]</a></div>');					  
            cursor.continue();
			
          }
          request.onerror = idbError_;
        }

        function idbCreate_() {
          if (!idb_) {
            if (idbRequest_) {
			  // If indexedDB is still opening, just queue this up.
              idbRequest_.addEventListener('success', idb_.removeObjectStore, false); 
            }
            return;
          }

          var request = idb_.setVersion('the new version string');
          request.onerror = idbError_;
          request.onsuccess = function(e) {
            if (!idb_.objectStoreNames.contains('myObjectStore')) {
              try {
                var objectStore = idb_.createObjectStore('myObjectStore', null); // FF is requiring the 2nd keyPath arg. It can be optional :( 
                idbLog_.innerHTML = "<p>Object store created.</p>";
              } catch (err) {
                idbLog_.innerHTML = '<p class="error">' + err.toString() + '</p>';
              }
            } else {
              idbLog_.innerHTML = '<p class="error">Object store already exists.</p>';
            }
          }
        }

        function idbSet_() {
          if (!idb_) {
            if (idbRequest_) {
			  // If indexedDB is still opening, just queue this up.
              idbRequest_.addEventListener('success', idb_.removeObjectStore, false); 
            }
            return;
          }

          if (!idb_.objectStoreNames.contains('myObjectStore')) {
            idbLog_.innerHTML = "<p class=\"error\">Object store doesn't exist.</p>";
            return;
          }

           // Create a transaction that locks the world.
          var objectStore = idb_.transaction(["myObjectStore"], IDBTransaction.READ_WRITE)
                                .objectStore("myObjectStore");
		     var prot = {};
         var d = new Date()
    		 document.getElementById('idb-key').value = d.getTime();
    		 prot.key =	document.getElementById('idb-key').value;

    		 prot.title  =	document.getElementById('idb-title').value;
    		 prot.text =	document.getElementById('idb-text').value;
         var request = objectStore.put(prot,	prot.key);			  			  
			  
          request.onerror = idbError_;
          request.onsuccess = idbShow_;
        }

        function updateKey_(key, element) {
          var newKey = element.textContent;
          var transaction = idb_.transaction(["myObjectStore"], IDBTransaction.READ_WRITE); // Create a transaction that locks the world.
          var objectStore = transaction.objectStore("myObjectStore");
          var request = objectStore.get(key);
          request.onerror = idbError_;
          request.onsuccess = function(e) {
            var value = e.result || this.result;  // FF4 requires e.result. IDBRequest.request isn't set :(;
            if (objectStore.delete) {
              var request = objectStore.delete(key);
            } else {
              var request = objectStore.remove(key); // FF4 not up to spect
            }
            request.onerror = idbError_;
            request.onsuccess = function(e) {
              var request = objectStore.add(value, newKey);
              request.onerror = idbError_;
              request.onsuccess = idbShow_;
            };
          };
        }

        function updateValue_(key, element) {
          var transaction = idb_.transaction(["myObjectStore"], IDBTransaction.READ_WRITE); // Create a transaction that locks the world.
          var objectStore = transaction.objectStore("myObjectStore");
          if(key && element){
              var request = objectStore.put(element.textContent, key);
              request.onerror = idbError_;
              request.onsuccess = idbShow_;
          }else {
            var value ={};
            var key = document.getElementById('idb-key').value;
            value.title = document.getElementById('idb-title').value;
            value.text = document.getElementById('idb-text').value;
            var request = objectStore.put(value, key);
            request.onerror = idbError_;
            request.onsuccess = idbShow_;            

          }
        }

        function editEntry_(key) {          
          var transaction = idb_.transaction(["myObjectStore"], IDBTransaction.READ_WRITE); // Create a transaction that locks the world.
          var objectStore = transaction.objectStore("myObjectStore");
          var request = objectStore.get(key);
          request.onerror = idbError_;
          request.onsuccess = function(e) {
            var value = e.result || this.result;  // FF4 requires e.result. IDBRequest.request isn't set :(;
            document.getElementById('idb-key').value = key;
            document.getElementById('idb-title').value = value.title;
            document.getElementById('idb-text').value = value.text;
            
          };
        }

        function deleteKey_(key) {
          var transaction = idb_.transaction(["myObjectStore"], IDBTransaction.READ_WRITE); // Create a transaction that locks the world.
          var objectStore = transaction.objectStore("myObjectStore");
          if (objectStore.delete) {
            var request = objectStore.delete(key);
          } else {
            var request = objectStore.remove(key);  // FF4 not up to spect
          }
          request.onerror = idbError_;
          request.onsuccess = idbShow_;
        }

        function idbRemove_() {
          if (!idb_) {
            if (idbRequest_) {
              idbRequest_.addEventListener('success', idb_.removeObjectStore, false); // If indexedDB is still opening, just queue this up.
            }
            return;
          }

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
                idResultsWrapper_.innerHTML = '';
                idbLog_.innerHTML = "<p>Object store removed.</p>";
              } catch (err) {
                idbLog_.innerHTML = '<p class="error">' + err.toString() + '</p>';
              }
            } else {
              idbLog_.innerHTML = "<p class=\"error\">Object store doesn't exist.</p>";
            }
          };
        }

        return {
          idbSet: idbSet_,
          idbCreate: idbCreate_,
          idbRemove: idbRemove_,
          updateKey: updateKey_,
          updateValue: updateValue_,
          deleteKey: deleteKey_,
          editEntry: editEntry_
        }
      })();