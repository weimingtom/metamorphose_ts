# metamorphose_ts
[WIP] Metamorphose (jill) TypeScript port

## History  
* 01:26 2021/10/1: first commit, many bugs to be fixed  

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

## What's UMD for TypeScript  
CMD = commonjs (for nodejs) = module  
AMD = requirejs (for chrome) = define  
UMD = CMD + AMD  

## How to debug this for nodejs  
I use VSCode (Visual Studio Code) to open dist/index.js, put a breakpoint (only for .js files under dist folder), and click 'run and debug' button to debug.   
This method is using vscode nodejs debugger, without typescript or ts-node.  
The output message see DEBUG CONSOLE. You can also add some watch variables or check variables' values on runtime.     
