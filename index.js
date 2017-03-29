let co = require('co');

const shift = q => q.shift();
const last = q => {
  const x = q.slice(-1)[0];
  q=[];
  return x;
};

const actor = (act, pick = shift) => {
  let queue = [];
  let notify = ()=>{};

  let next = (sizzle) => {

    if(sizzle) q = sizzle(q);

    if(queue.length) {
      notify = () => {};
      return Promise
        .resolve(pick(queue));
    }

    return new Promise(done=>{notify = done})
      .then(_=>pick(queue));
  }

  co(function*(){
    yield* act(next);
  }).catch(e => console
    .log('actor terminated due to unhandled exception: ', e)
  )


  return msg => {
    let D, R;

    let p = new Promise((done, reject) => {
      D = done;
      R = reject;
    });

    queue.push([msg, D, R]);

    notify();
    return p;
  }
}

const wait = (ms, x) => new Promise(d => setTimeout(_=>d(x), ms));



const callIT = x=>{
  if(typeof(x) == 'function') return x();
  return x;
}

const tryResolve = p => new Promise( done => {
  Promise
    .resolve(p)
    .then( x=> done([1,x]) )
    .catch( x=> done([0,x]) )
})

const each = (f) => {
  return function*(next) {
    while(1) {
      const [msg, done, reject] = yield next();
      const [success, result] = yield tryResolve(f(msg));
      const Next = success?done:reject;

      Next((result!=undefined)?
        result:
        msg
      );
    }
  }
}

const timeFramed = (ms, act) => actor(function*(next){
  while(1) {
    const [value, done, error] = yield next();
    const watch = wait(ms);
    const task = act(value);

    task.then(done)
      .catch(error);

    yield [task, watch];
  }
})

function* worker(next) {
  while(1) {
    const [task, done, reject] = yield next();
    const [success, result] = yield tryResolve(callIT(task));
    const Next = success ? done: reject;
    Next(result);
  }
}


module.exports = {
  worker,
  wait,
  each,
  tryResolve,
  timeFramed,
  actor,
  shift
}


