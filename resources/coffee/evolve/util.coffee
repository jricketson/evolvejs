CORE.util =
  MAXHASHCHECK: 50
  getHashCode: (memory) ->
    
    # returns a hashcode for the memory
    hash = 0
    maxcheck = CORE.util.MAXHASHCHECK
    ii = 0

    while ii < memory.length and ii < maxcheck
      hash += memory[ii] * ii
      ii += 1
    hash

  getUserProfile: ->
    CORE.data.getUserProfile (userProfile) ->
      CORE.userProfile = userProfile
      if CORE.userProfile is null
        $("#logoutLink").hide()
        $("#loginLink").show()
      else
        $("#username").html CORE.userProfile.username
        $("#logoutLink").show()
        $("#loginLink").hide()

