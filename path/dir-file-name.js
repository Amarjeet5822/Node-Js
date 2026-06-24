// __dirname and __filename are special variables available in CommonJS modules that provide the directory name and file name of the current module.

/** in CommonJS modules, __dirname and __filename are available by default.
*/
//  const path = require('path');
//  console.log("Directory Name: ", __dirname); // return full path without current file name
//  console.log('file Name: ', __filename); // return full path with current file name.
 
//  // Building paths relative to the current module
//  const configPath = path.join(__dirname, 'config', 'app-config.json');
//  console.log('Config File Path: ', configPath);
 
//  console.log('Directory using path.dirname() : ', path.dirname(__filename));

/**
 * ES modules do not have __dirname and __filename by default. However, you can achieve similar functionality using the import.meta.url property and the URL module.
 */

// import { fileURLToPath } from "url";
// import { dirname } from "path";

// // Get the current module's URL
// const file_name = fileURLToPath(import.meta.url);
// const __dirname = dirname(file_name);

// console.log("Es module Director Name :", __dirname);
// console.log("Es module File name: ", file_name);

/**
 * path.extname() 
 * Returns the extension of a path, from the last occurrence of the . character to the end of the string.
 */
// const path = require('path');
// const extension = path.extname('file.txt');
// console.log('file.txt: ',extension);
// console.log('dir-file-name.php: ', path.extname('dir-file-name.php'));
// console.log('index.coffee.md: ', path.extname('index.coffee.md'));

/**
 * path.join()
 * Joins all given path segments together using the platform-specific as a delimiter, then normalizes the resulting path.
 */
// const path = require('path');
// // Join path segments
// const fullPath = path.join('folder1', 'folder2', 'folder3', 'amar.txt');
// console.log('fullpath : ', fullPath);// o/p : folder1/folder2/folder3/amar.txt

// // Handle relative paths and navigation
// console.log(path.join('/users', '../admin', 'logs', 'log.txt')); 
// // Output: /admin/logs/log.txt

/**
 * path.resolve()
 * Resolves a sequence of paths or path segments into an absolute path, processing from right to left until an absolute path is constructed.
 */
// const path = require('path');

// // 1. Resolve relative to current working directory
// console.log(path.resolve('file.txt'));
// // 2. Resolve with multiple segments
// console.log(path.resolve('/users', 'docs', 'file.txt'));
// // 3. Right-to-left processing
// console.log(path.resolve('/first', '/second', 'third'))
// // 4. Using __dirname for module-relative paths
// console.log(path.resolve(__dirname, 'config', 'app.json'));

/**
 * path.parse()
 * Returns as object whose properties represent significant elements of the path.
 */
// const path = require('path');

// // Parse a file path
// const pathInfo = path.parse('/users/docs/file.txt');
// console.log('pathInfo = ', pathInfo);
// // pathInfo =  {
// //   root: '/',
// //   dir: '/users/docs',
// //   base: 'file.txt',
// //   ext: '.txt',
// //   name: 'file'
// // }
// // Accessing parsed components
// console.log('Directory ', pathInfo.dir) // /users/docs
// console.log('Filename : ', pathInfo.base) // file.txt
// console.log('Name only', pathInfo.name) // file
// console.log('Extension : ', pathInfo.ext); // .txt

/**
 * path.format()
 * Returns a path string from an object, which is the opposite of path.parse().
 */
// Formatting path objects.
const path = require('path');

// Method 1: Using dir and base
const pathString1 = path.format({
    dir: '/users/docs',
    base: 'file.txt',
})
console.log('pathString1 : ', pathString1)

// Method 2: Using root, dir, name, and ext
const pathString2 = path.format({
root: '/',
dir: '/users/docs',
name: 'file',
ext: '.txt'
});
console.log(pathString2);