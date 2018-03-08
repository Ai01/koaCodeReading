const log = async (ctx, next) => {
  const { request } = ctx;
  const { host } = request;

  const old = new Date();

  console.log('log request url:', host);
  if (next) {
    await next();
  }

  const now = new Date();

  console.log('log use time:', ` ${now.getTime() - old.getTime()}ms`);
};

exports.log = log;
