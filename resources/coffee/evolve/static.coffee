CORE.staticpage = initialise: ->
  CORE.util.getUserProfile()

$(document).ready $.proxy(CORE.staticpage.initialise, CORE.staticpage)
