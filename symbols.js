module.exports = {
  // smallify properties
  kSmallifyRoot: Symbol('smallify.root'),
  kSmallifyName: Symbol('smallify.name'),
  kSmallifyOptions: Symbol('smallify.options'),
  kSmallifyRouterPrefix: Symbol('smallify.router.prefix'),
  kSmallifyVersion: Symbol('smallify.version'),
  kSmallifyAvvio: Symbol('smallify.avvio'),
  kSmallifyPino: Symbol('smallify.pino'),
  kSmallifyErrio: Symbol('smallify.errio'),
  kSmallifyServer: Symbol('smallify.server'),

  kSmallifyChildren: Symbol('smallify.children'),
  kSmallifyRoutes: Symbol('smallify.routes'),
  kSmallifyDecorates: Symbol('smallify.decorates'),

  kServerListening: Symbol('server.listening'),

  kQueueRoutes: Symbol('queue.routes'),

  kRouteSmallify: Symbol('route.smallify'),
  kRouteParent: Symbol('route.parent'),
  kRouteRequest: Symbol('route.request'),
  kRouteReply: Symbol('route.reply'),

  kRequestRoute: Symbol('request.route'),

  kReplyRoute: Symbol('reply.route')
}
