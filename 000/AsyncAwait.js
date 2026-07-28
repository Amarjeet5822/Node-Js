// 1. Remember that async functions always return Promises
async function myAsyncFunction() {
    return "Hello Amar";
};
const result = myAsyncFunction();
console.log(result); // Promise { 'Hello Amar' }

// You need to await it or use .then()
result.then(message => console.log(message)); // Hello
/**
 * ---------------------------------------------------------------------------------
 */
// 2. Use Promise.all for concurrent operations
// When operations can run in parallel, use Promise.all to improve performance.

async function fetchData1() {
    return new Promise(resolve => setTimeout(() => resolve("Data 1"), 100));
}

async function fetchData2() {
    return new Promise(resolve => setTimeout(() => resolve("Data 2"), 1500));
}

async function fetchAllData() {
    const [data1, data2] = await Promise.all([fetchData1(), fetchData2()]);
    console.log(data1); // Data 1
    console.log(data2); // Data 2
}
fetchAllData();

/**
 * ---------------------------------------------------------------------------------
 */
// Problem: Nested Callbacks (Callback Hell)

getUser(1, (err, user) => {
  if (err) return handleError(err);
  getOrders(user.id, (err, orders) => {
    if (err) return handleError(err);
    processOrders(orders, (err) => {
      if (err) return handleError(err);
      console.log('All done!');
    });
  });
});
getUser(1);
// Solution: Using Async/Await

async function getUser(userId) {
    // Simulate fetching user data
    return new Promise(resolve => setTimeout(() => resolve({ id: userId, name: "Amar" }), 100));
}

async function getOrders(userId) {
    // Simulate fetching orders for the user
    return new Promise(resolve => setTimeout(() => resolve(["Order1", "Order2"]), 1500));
}

async function processOrders(orders) {
    // Simulate processing orders
    return new Promise(resolve => setTimeout(() => resolve(), 500));
}

async function main() {
    try {
        const user = await getUser(1);
        const orders = await getOrders(user.id);
        await processOrders(orders);
        console.log('All done!');
    } catch (err) {
        console.error(err);
    }
}
main();

// Even Better: Async/Await
async function processUser(userId) {
  try {
    const user = await getUser(userId);
    const orders = await getOrders(user.id);
    await processOrders(orders);
    console.log('All done!');
  } catch (err) {
    handleError(err);
  }
}
processUser(1);
