
// Using the Path Module

// const path = require('path');
// const { join, resolve, basename } =  require('path');

// import path from 'path';
// import { join, resolve, basename } from 'path';

// -------------------------------------------------------------------

// Path Module Methods
// path.basename()
// Returns the last portion of a path, similar to the Unix basename command.

const path = require('path');
const filename = path.basename('../../NODE-JS/modules.js');
console.log(filename); // Output: modules.js

const filenameWithoutExt = path.basename('../../NODE-JS/modules.js', '.js');
console.log(filenameWithoutExt); // Output: modules


