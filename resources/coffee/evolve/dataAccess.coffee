CORE.data =
  SPECIES_URL: "/data/species/"
  CPUTIME_URL: "/data/cputime/"

  saveSpecies: (species) ->
    postData =
      code: CORE.assembler.convertCodeToString(species.code)
      name: species.name
      count: species.count - species.sentCount

    postData.parentRef = species.getParent().pk if species.getParent()?
    $.post(@SPECIES_URL, postData).done (data) ->
      species.pk = data[0].pk
      species.displayName = data[0].fields.uniqueName

  putScore: (species, score) ->
    species.scoreList.push score
    $.get "#{@SPECIES_URL}addScore/#{species.pk}/?score=#{score}"

  putCpuTime: (amount) ->
    $.post(@CPUTIME_URL, {time: amount})

  getSingleSpecies: (id, callback) ->
    $.getJSON "#{@SPECIES_URL}id/#{id}/", callback

  getSpecies: (count) ->
    $.getJSON("#{@SPECIES_URL}list/0/#{count}")

  getChildrenOfSpecies: (id, callback) ->
    $.getJSON "#{@SPECIES_URL}children/#{id}/", callback

  getUserProfile: ->
    $.get("/data/user/id/0")
