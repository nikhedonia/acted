#acted

actor library for js



## example


```js
import {actor, timeWindowed, worker} from 'acted'

let log = actor(function*(next){
  const value = yield next();
  console.log(value);
})


console.log('logger is asnyc');
log(1);
console.log('logger returns promise');
log(2).then( _=> console.log('logging complete') )

const slowLog = timeWindowed( log, 1000 );

slowLog(3).then( ()=> console.log('executes task and moves on to next task when at least 1 second has passed') )
slowLog(4).then( ()=> console.log('does start timer with task') )



let sortedLog = actor(function*(next){
  const value = yield next();
  console.log(value);
}, q => { q = q.sort(); return q.shift(); })


//sorts the batch of items before running
sortedLog(2);
sortedLog(1);
sortedLog(3);



//performs async work
const run = actor(worker);
run( x=>1 ).then( x=> console.log('done :', x) );
run( x=>2 ).then( x=> console.log('done :', x) );

```
