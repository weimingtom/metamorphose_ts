import { Test1 } from './Test1';
import { Hook } from './lua/Hook';
import { Debug } from './lua/Debug';
import { Lua } from './lua/Lua';

class Hook2 implements Hook {
    luaHook(L: Lua, ar: Debug): number {
        throw new Error('Method not implemented.');
    }
}

console.log("hello, world!");
console.log(new Test1().hello);
