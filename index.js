import co from 'co';

export const shift = q => q.shift();
export const actor = (act, pick = shift) => {
  let queue = [];
  let notify = ()=>{};

  let next = () => {
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
  });

  return (task) => {
    let D, R;

    let p = new Promise((done, resolve) => {
      D=done;
      R=resolve;
    });

    queue.push(() => Promise
      .resolve(task())
      .then(D)
      .catch(R)
    );

    notify();
    return p;
  }
}

const wait = (ms, x) => new Promise(d => setTimeout(_=>d(x), ms));

export const timeWindowed = (work, ms) =>
  x => work(_=>Promise.all([x(), wait(ms)]))
    .then(x=>x[0])

export function* worker(next) {
  while(1) {
    yield (yield next())()
  }
}

/*
const tw = timeWindowed(
  actor(worker)
  ,1000
);
*/
