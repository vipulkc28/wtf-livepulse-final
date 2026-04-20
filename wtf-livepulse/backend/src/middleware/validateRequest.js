export function requireSimulatorSpeed(req, _res, next) {
  const speed = Number(req.body?.speed);
  if (![1, 5, 10].includes(speed)) {
    return next(Object.assign(new Error('speed must be one of 1, 5, 10'), { statusCode: 400 }));
  }
  next();
}
