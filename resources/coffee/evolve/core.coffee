# if no firebug installed
unless window.console
  window.console =
    log: ->
    debug: ->
    info: ->

window.CORE = CORE or {}
CORE.NET_RETRY_TIMEOUT = 2000
CORE.EVENT_LOG_MESSAGE = "log_message"

CORE.asyncWhen = (whenFn, execFn, timeout, timesLeft) ->
  timeout = timeout or 500
  timesLeft = timesLeft or 20
  throw "this asychronous event never happened\n" + whenFn.toString()  if timesLeft is 0
  if whenFn()
    execFn()
  else
    setTimeout (->
      CORE.asyncWhen whenFn, execFn, timeout, timesLeft - 1
    ), timeout

CORE.trackEvent = (category, action, label, value) ->
  @asyncWhen (->
    CORE.pageTracker isnt `undefined`
  ), (->
    CORE.pageTracker._trackEvent category, action, label, value
  ), 1000

CORE.throttle = (fn, delay) ->
  t = new CORE.Throttle(fn, delay)
  -> t.execute.apply t, arguments

CORE.getFunctionName = (fn) ->
  m = fn.toString().match(/^\s*function\s+([^\s\(]+)/)
  (if m then m[1] else "")

CORE.removeElementFromArray = (array, element) ->
  ii = 0
  while ii < array.length
    break  if array[ii] is element
    ii += 1
  array.splice ii, 1

CORE.convertJsonListToObject = (list, ObjectConstructor) ->
  return (new ObjectConstructor(item) for item in list)

CORE.logToBase = (x, base) ->
  # Created 1997 by Brian Risk. http://members.aol.com/brianrisk
  (Math.log(x)) / (Math.log(base))

CORE.handleErrorAsError = (msg, url, l) ->
  console.error "ERROR", msg, url, l
  CORE.logError
    msg: msg
    url: url
    lineNumber: l
  false

CORE.handleErrorAsWarning = (msg, url, l) ->
  console.warn "ERROR", msg, url, l
  CORE.logError
    msg: msg
    url: url
    lineNumber: l
  true

CORE.logError = (error) ->
  $.post "/data/errorLog/", error

CORE.messageTemplate = "<div class=\"msg\">{msg}</div>"
CORE.displayMessage = (msg, timeout) ->
  timeout = timeout or 10000
  msgDiv = $(CORE.messageTemplate.supplant(msg: msg)).hide()
  close = ->
    msgDiv.slideUp "normal", ->
      msgDiv.remove()

  $("#messages").append msgDiv
  msgDiv.slideDown("normal").click close
  setTimeout close, timeout

CORE.sizeProcesses = ->
  for process in CORE.environment()._currentProcesses
    size = CORE.sizeInMemory(process)
    $.debug(i, size, process) if size > 2000

CORE.sizeInMemory = (obj) ->
  sim = (obj, recurseLevel=0) ->
    size = 0
    return 0 if alreadySeenObjects.indexOf(obj) > -1 or recurseLevel > 8
    return 1 unless obj? #assume 1 byte. I am sure that this is wrong.
    if $.isArray(obj)
      alreadySeenObjects.push obj
      for thing in obj
        size += sim(thing, recurseLevel + 1)
    else if $.isPlainObject(obj) or (obj.constructor isnt `undefined` and ["Process", "Thread", "Species"].indexOf(obj.constructor.name) isnt -1) #keep the jquery objects out
      alreadySeenObjects.push obj
      for own k,v of obj
        size += sim(v, recurseLevel + 1) 
    else if typeof obj is "object"
      return 1 #completely wrong
    else if typeof obj is "string"
      return obj.length #assume each char is one byte
    else if typeof obj is "number"
      return 4 #assume 32 bit
    else if typeof obj is "boolean"
      return 1 #assume 1 byte
    else if typeof obj is "function"
      return 1 #assume 1 byte. I am sure that this is wrong.
    else
      #$.debug("not one of the expected types",obj.toString(), typeof obj, obj.context);
      return 0
    size
  alreadySeenObjects = []
  sim obj

$.ajaxSetup cache: false
$("#loadingMessage").ajaxStart((e) ->
  $(this).show()
).ajaxStop (e) ->
  $(this).hide()

$("#ajaxErrorMessage").ajaxError (e) ->
  self = this
  $(self).stop(true, true).fadeIn(500)
  setTimeout((->$(self).stop(true, true).fadeOut(500)), 5000)

CORE.Throttle = (@fn, @delay=50) ->
  @executionTimer = null

CORE.Throttle::execute = ->
  clearTimeout @executionTimer if @executionTimer
  args = arguments
  fn = @fn
  @executionTimer = setTimeout(->
    fn.apply null, args
  , @delay)

if typeof Object.create isnt "function"
  Object.create = (o) ->
    F = ->
    F:: = o
    new F()

Function::curry = ->
  args = Array::slice.call(arguments)
  fn = this
  ->
    innerArgs = Array::slice.call(arguments)
    finalArgs = args.concat(innerArgs)
    fn.apply null, finalArgs

#From http://javascript.crockford.com/
String::supplant = (o) ->
  $.debug "o is null", this  if o is null
  @replace /\{([^\{\}]*)\}/g, (a, b) ->
    r = o[b]
    (if typeof r is "string" or typeof r is "number" then r else a)

String::lpad = (l) -> l.substr(0, (l.length - this.length)) + this
