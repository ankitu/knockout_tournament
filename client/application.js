var tournamentModule = tournamentModule || {};

tournamentModule.App = (function () {

  class Tournament {

    constructor(elementName, apiRequestObj, apiPath) {
      this.apiRequest = apiRequestObj.request;
      this.apiPath = apiPath;
      document.getElementById(elementName).addEventListener('click', this.createTournament.bind(this));
    }

    // Function to clear all the tournament and round related data from DOM
    clear() {
      document.getElementById('error').innerText = '';
      document.getElementById('matches-wrapper').innerHTML = '';
      document.getElementById('winner-wrapper').style.display = 'none';
    }

    createTournament() {
      this.clear();
      let teamsPerMatch = document.getElementById('teamsPerMatch').value;
      let numberOfTeams = document.getElementById('numberOfTeams').value;
      let payload = {
        teamsPerMatch: teamsPerMatch,
        numberOfTeams: numberOfTeams
      };

      this.apiRequest(this.apiPath.TOURNAMENT, payload, 'post').then((response) => {
        if ('error' in response) {
          const error = new Error(response.message);
          error.response = response;
          throw error;
        } else {
          // Merge response and payload
          Object.assign(response, payload);
          // Start matches
          new Matches(response, this.apiRequest, this.apiPath);
        }
      }).catch((error) => {
        document.getElementById('error').innerText = error.message;
      });
    }

  }

  // Class to simulate matches
  class Matches {

    constructor(tournamentInfo, apiRequest, apiPath) {
      this.apiRequest = apiRequest;
      this.apiPath = apiPath;
      this.tournamentId = tournamentInfo.tournamentId;
      this.matches = tournamentInfo.matchUps;
      this.teamsPerMatch = parseInt(tournamentInfo.teamsPerMatch);
      this.numberOfTeams = parseInt(tournamentInfo.numberOfTeams);

      this.teamsData = {}; // Object to store all the teams data, to improve 2nd run performance
      this.currentRound = 0;
      this.nextRoundWinners = [];

      this.startMatches();
    }

    // Function to update rounds and match elements
    domUpdate() {
      // Round's template
      let roundTemplate = `<div class="rounds">
        <span class="round">Round ${this.currentRound + 1}</span>
        <ul id="matches${this.currentRound}"></ul>
      </div>`;
      document.getElementById('matches-wrapper').appendChild(document.createRange().createContextualFragment(roundTemplate));

      this.matches.forEach((value, index) => {
        // Match's template
        let template = `<li class="match-block" title="Match ${value.match + 1}" id="r${this.currentRound}-m${value.match}"></li>`;
        let matchesId = 'matches' + this.currentRound;
        document.getElementById(matchesId).appendChild(document.createRange().createContextualFragment(template));
        // Send instance 'simulate match' request for first 5 matches to improve 'First Response' metrics
        if (index < 5) {
          this.simulateMatch(this.currentRound, value.match, value.teamIds);
        } else { // Delayed 'simulate match' request (40 * matchIndex)ms after 5th match
          setTimeout(() => {
            this.simulateMatch(this.currentRound, value.match, value.teamIds);
          }, 40 * index);
        }
      })
    }

    startMatches() {
      document.getElementById('match-message').innerText = 'Teams warming up, getting ready for an awesome tournament';
      this.domUpdate();
    }

    // Function to create matchUps from allWinners array
    matchUps(array, split) {
      let matchUps = [];
      let count = split;
      let chunk = [];
      for (let counter = 0; counter < array.length; counter++) {
        if (count--) {
          chunk.push(array[counter]);
        }
        if (!count) {
          count = split;
          matchUps.push({ match: matchUps.length, teamIds: JSON.parse(JSON.stringify(chunk)) });
          chunk = [];
        }
      }
      return matchUps;
    }

    startNextRound() {
      if (this.matches.length === 1) {
        document.getElementById('winner').innerText = this.teamsData[this.nextRoundWinners[0]].name;
        document.getElementById('winner-wrapper').style.display = 'block';
      } else {
        this.currentRound = this.currentRound + 1;
        this.nextRoundWinners.sort(function (first, second) { return first - second });
        this.matches = this.matchUps(this.nextRoundWinners, this.teamsPerMatch);
        this.nextRoundWinners = [];
        this.domUpdate(); // Calling domUpdate to start next round
      }
    }

    simulateMatch(round, match, teams) {
      let teamsApiCall = [];
      if (round === 0) {
        // forEach to check whether teams data exist in 'teamsData' array or not
        teams.forEach((value, index) => {
          if (!(value in this.teamsData)) {
            let data = {
              tournamentId: this.tournamentId,
              teamId: value
            }
            let url = this.apiPath.TEAM;

            teamsApiCall.push({ data: data, url: url });
          }
        });
      }

      // Creating payload for match info request
      let matchPayload = {
        tournamentId: this.tournamentId,
        match: match,
        round: round
      }
      teamsApiCall.push({ data: matchPayload, url: this.apiPath.MATCH });

      // Sending requests for teams info and match info
      Promise.all(teamsApiCall.map((apiCall) => {
        return this.apiRequest(apiCall.url, apiCall.data, 'get').then((response) => {
          if ('teamId' in response) {
            this.teamsData[response.teamId] = response;
          } else {
            return response.score; // return 'match' score is 'teamId' is not present in response
          }
        });
      }))
        .then((response) => {
          let matchScore = response[response.length - 1];
          this.getMatchWinner(match, matchScore, teams, round);
        });
    }

    getMatchWinner(matchId, matchScore, teams, round) {
      // Payload for 'winner' api
      let payload = {};
      payload.tournamentId = this.tournamentId;
      payload.matchScore = matchScore;
      payload.teamScores = teams.map((value) => {
        return this.teamsData[value].score;
      });

      this.apiRequest(this.apiPath.WINNER, payload, 'get')
        .then((response) => {
          if (!this.nextRoundWinners.length && !round) {
            let matchMsg = document.getElementById('match-message');
            matchMsg.innerText = '';
            matchMsg.style.display = 'none';
          }

          let winner = teams.filter((value) => {
            return this.teamsData[value].score == response.score;
          });

          this.nextRoundWinners.push(winner[winner.length - 1]);
          let matchBlockId = '#matches' + round;
          // Adding 'done' class to match completed
          document.querySelectorAll(matchBlockId + ' li:not(.done)')[0].classList.add('done');

          // All matches in current round are completed i.e winners in currentround equals total round matches, then start next round
          if (this.nextRoundWinners.length === this.matches.length) {
            this.startNextRound();
          }
        });
    }

  }

  return {
    Tournament: Tournament
  }
})();