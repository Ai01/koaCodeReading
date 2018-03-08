// 自己实现的简单 koa-compose
// compose用来将多个middleWare组合为一个middleWare。同时compose还是一个middleWare
const compose = middleWares => {
  if (!Array.isArray(middleWares)) {
    throw new TypeError(' middleWare stack must be an array');
  }

  for (const f of middleWares) {
    if (typeof f !== 'function') {
      throw new TypeError(' middleWare must be function ');
    }
  }


  const dispatch  = (ctx, i) => {
   const fn = middleWares[i];

   if(fn) {
     return Promise.resolve(fn(ctx,()=>{
       return dispatch(ctx, i + 1);
     }))
   }

  };


  return async (ctx, next) => {
    dispatch(ctx, 0);
    if(next) {
      await next();
    }
  };
};

module.exports = compose;
