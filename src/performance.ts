export const measure = (log, msg, fn) =>
  Promise.resolve(Date.now()).then(start =>
    fn().then(res => {
      log
        .child({
          action: 'measure-performance',
          duration: Date.now() - start
        })
        .info(msg)
      return res
    })
  )
