CORE.data =
  SPECIES_URL: "/data/species/"
  CPUTIME_URL: "/data/cputime/"

  saveSpecies: (species, callback) ->
    postData =
      code: CORE.assembler.convertCodeToString(species.code)
      name: species.name
      count: species.count - species.sentCount

    postData.parentRef = species.getParent().pk if species.getParent()?
    $.post @SPECIES_URL, postData, (data) ->
      species.pk = data[0].pk
      species.displayName = data[0].fields.uniqueName
      callback()

  putScore: (species, score, callback) ->
    $.get @SPECIES_URL + "addScore/" + species.pk + "/?score=" + score, callback
    species.scoreList.push score

  putCpuTime: (amount, callback) ->
    $.post(@CPUTIME_URL, {time: amount}, callback)

  getSingleSpecies: (id, callback) ->
    $.getJSON "#{@SPECIES_URL}id/#{id}/", callback

  getSpecies: (count, callback) ->
    $.getJSON "#{@SPECIES_URL}list/0/#{count}", callback

  getChildrenOfSpecies: (id, callback) ->
    $.getJSON "#{@SPECIES_URL}children/#{id}/", callback

  getUserProfile: (callback) ->
    $.get "/data/user/id/0", (data) ->
      callback data, @_stringToDate

  _stringToDate: (key, value) ->
    if typeof value is "string"
      a = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
      return new Date(Date.UTC(+a[1], +a[2] - 1, +a[3])) if a
    value
