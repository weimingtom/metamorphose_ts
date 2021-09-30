# metamorphose_ts
[WIP] Metamorphose (jill) TypeScript port

## demo  
* For PC (from console.js) :   
https://weimingtom.github.io/metamorphose_ts/console.html
 
* For mobile phone (from jxcore-repl) :  
https://weimingtom.github.io/metamorphose_ts/repl.html  

## How to build for chrome and nodejs  
$ npm install -g typescript  
$ tsc  
Open console.html or repl.html, and then debug with chrome  
or  
$ node dist/index.js  

## How to build for ts-node  
$ npm install -g ts-node    
$ ts-node src/index.ts  

## What's about UMD for TypeScript  
CMD = commonjs (for nodejs) = module  
AMD = requirejs (for chrome) = define  
UMD = CMD + AMD  
