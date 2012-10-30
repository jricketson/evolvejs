CORE.util =
  MAXHASHCHECK: 50
  getHashCode: (memory) ->    
    # returns a hashcode for the memory
    hash = 0
    maxcheck = CORE.util.MAXHASHCHECK
    for op, ii in memory when ii < maxcheck
      hash += op * ii
    hash

  getUserProfile: ->
    CORE.data.getUserProfile (userProfile) ->
      CORE.userProfile = userProfile
      unless CORE.userProfile?
        $("#logoutLink").hide()
        $("#loginLink").show()
      else
        $("#username").html CORE.userProfile.username
        $("#logoutLink").show()
        $("#loginLink").hide()

