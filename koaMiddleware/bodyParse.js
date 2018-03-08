const bodyParse = async (ctx, next) => {

  const { request } = ctx;
  console.log('request',request);

  if(next) {
    await next();
  }


};

exports.bodyParse = bodyParse;
