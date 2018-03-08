const f1 = async next => {
  console.log('f1');
  if (next && typeof next === 'function') {
    await next();
  }
  console.log('f1-last');
};

const f2 = async next => {
  console.log('f2');
  if (next && typeof next === 'function') {
    await next();
  }
  console.log('f2-last');
};

const f3 = async next => {
  console.log('f3');
  if (next && typeof next === 'function') {
    await next();
  }
  console.log('f3-last');
};

// compose 需要达到的效果

// f1(f2(f3));

const a = [f1, f2, f3];

// 函数式编程
const compose = a => {
  const dispatch = i => {
    let fn = a[i];

    if (fn) {
      return Promise.resolve(
        fn(() => {
          return dispatch(i + 1);
        }),
      );
    }
  };

  return dispatch(0);
};

compose(a);
