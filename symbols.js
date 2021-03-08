module.exports = {
  // smallify properties
  kSmallifyRoot: Symbol('smallify.root'),
  kSmallifyName: Symbol('smallify.name'),
  kSmallifyLevel: Symbol('smallify.level'),
  kSmallifyFullname: Symbol('smallify.fullname'),
  kSmallifyOptions: Symbol('smallify.options'),
  kSmallifyRouterPrefix: Symbol('smallify.router.prefix'),
  kSmallifyVersion: Symbol('smallify.version'),
  kSmallifyAvvio: Symbol('smallify.avvio'),
  kSmallifyPino: Symbol('smallify.pino'),
  kSmallifyErrio: Symbol('smallify.errio'),
  kSmallifyServer: Symbol('smallify.server'),

  kSmallifyParent: Symbol('smallify.parent'),
  kSmallifyChildren: Symbol('smallify.children'),
  kSmallifyRoutes: Symbol('smallify.routes'),
  kSmallifyDecorates: Symbol('smallify.decorates'),
  kSmallifyRequest: Symbol('smallify.request'),
  kSmallifyReply: Symbol('smallify.reply'),
  kSmallifyParserDict: Symbol('smallify.parser'),
  kSmallifySerializerDict: Symbol('smallify.serializer'),

  kQueueRoutes: Symbol('queue.routes'),
  kQueueInjects: Symbol('queue.injects'),

  kRouteSmallify: Symbol('route.smallify'),
  kRouteParent: Symbol('route.parent'),
  kRouteRequest: Symbol('route.request'),
  kRouteReply: Symbol('route.reply'),
  kRouteSpan: Symbol('route.span'),

  kRequestRoute: Symbol('request.route'),
  kRequestRaw: Symbol('request.raw'),
  kRequestQuery: Symbol('request.query'),
  kRequestParams: Symbol('request.params'),
  kRequestBody: Symbol('request.body'),

  kReplyRoute: Symbol('reply.route'),
  kReplyRaw: Symbol('reply.raw'),
  kReplySent: Symbol('reply.sent'),
  kReplyAllowSend: Symbol('reply.allow.send'),
  kReplyHeaders: Symbol('reply.headers'),
  kReplyHasStatusCode: Symbol('reply.has.status.code'),
  kReplyPayload: Symbol('reply.payload'),

  kValidationParams: Symbol('validation.params'),
  kValidationQuery: Symbol('validation.query'),
  kValidationBody: Symbol('validation.body'),

  kSerializerPayload: Symbol('serializer.payload'),

  kHookLevel: Symbol('hook.level'),

  kSmallifyPluginMeta: Symbol.for('smallify.plugin.meta')
}
