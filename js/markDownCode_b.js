(function () {
    var converter1 = Markdown.getSanitizingConverter();
    var editor1 = new Markdown.Editor(converter1);
    editor1.run();
                    
    var help = function () { alert("Do you need help?"); }
                    
})();

(function(){

        var idbRequest_;
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
          idbRequest_ = window.indexedDB.open("FriendDB", "My Friends!");
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
            // idbLog_.innerHTML = "<p>Object store not yet created.</p>";
            alert("idbShow_ idb_.objectStoreNames.contains")
            return;
          }

        
        if (idbRequest_.version != '1') {
          // User's first visit, initialize database.
          idbRequest_.createObjectStore('Friends', // name of new object store
                                'id',      // key path
                                true);     // auto increment?
          idbRequest_.setVersion('1');
        } else {
          // DB already initialized.
        }
        // body...

        var store = idbRequest_.openObjectStore('Friends');

        var user = store.put({name: 'Eric', gender: 'male', likes: 'html5'});
        console.log(user.id); // Expect 1
        var user = store.put({name: 'Jane', gender: 'female', likes: 'shoes'});
        console.log(user.id); // Expect 1

})();


