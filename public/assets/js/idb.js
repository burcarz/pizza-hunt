// create variable to hold db connection
let db;
// establish a connection to IndexDB database called 'pizza-hunt' and set it to version 1
const request = indexedDB.open('pizza-hunt', 1);

// this event will emit if the database version changes (nonexistant to version 1, v1 to v2, etc)
request.onupgradeneeded = function(event) {
    // save reference to the database
    const db = event.target.result;
    // create an object store called 'new_pizza', set it to have an auto increment primary key of sorts
    db.createObjectStore('new_pizza', { auto-increment: true });
};

// upon successful
request.onsuccess = function(event) {
    // when db is successfully created with its object store (from onupgradeneeded event above) or established a connection, save ref to db in global var
    db = event.target.result;
    // check if app is online, if yes, uploadPizza() function to send all local db data to api
    if (navigator.online) {
        
    }
}

request.onerror = function(event) {
    // log error here
    console.log(event.target.errorCode);
}

// function that executes if there is attempt to submit new pizza and there is no internet connection
function saveRecord(record) {
    // open a new transaction with the database with read and write permissions
    const transaction = db.transaction(['new__pizza'], 'readwrite');

    // access the object store for 'new_pizza'
    const pizzaObjectStore = transaction.objectStore('new_pizza');

    // add record to store with add method
    pizzaObjectStore.add(record);
}

function uploadPizza() {
    // open a transaction on your db
    const transaction = db.transaction(['new_pizza', 'readwrite']);

    // access your object store
    const pizzaObjectStore = transaction.objectStore('new_pizza');

    // get all records from store and set to variable
    const getAll = pizzaObjectStore.getAll();

    // upon a successful .getAll() execution, run this function
    getAll.onsuccess = function() {
        // if there was data in indexDb's store, send it to the api server
        if (getAll.result.length) {
            fetch('/api/pizzas', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                }
            })
            .then(res => res.json())
            .then(serverRes => {
                if (serverRes.message) {
                    throw new Error(serverRes);
                }
                // open one more transaction
                const transaction = db.transaction(['new_pizza'], 'readwrite');
                // access the new_pizza object store
                const pizzaObjectStore = transaction.objectStore('new_pizza');
                // clear all items in your store
                pizzaObjectStore.clear();

                alert('All saved pizzas have been submitted');
            })
            .catch(err => {
                console.log(err);
            });
        }
    }
};

// listen for app coming back online
window.addEventListener('online', uploadPizza);