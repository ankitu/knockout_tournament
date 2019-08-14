var tournamentModule = tournamentModule || {};

// Class to return all the api path

tournamentModule.ApiPath = (function () {
  class ApiPath {

    constructor() { }
    /*
    @apipath tournament
    @type post
    @apiparams teamsPerMatch, numberOfTeams
    */
    get TOURNAMENT() {
      return '/tournament';
    }

    /*
    @apipath team
    @type get
    @apiparams tournamentid, teamId
    */
    get TEAM() {
      return '/team';
    }

    /*
    @apipath match
    @type get
    @apiparams tournamentid, round, match
    */
    get MATCH() {
      return '/match'
    }

    /*
    @apipath winner
    @type get
    @apiparams tournamentid, [teamscores], matchscore
    */
    get WINNER() {
      return '/winner'
    }
  }

  return new ApiPath();

})();