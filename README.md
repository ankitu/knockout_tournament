# Knockout Tournament

The application simulate a single-elimination knockout tournament in the browser, determining the winner as quickly as possible.

Rules of the simulation are as following:

1. The user enters the teams participating per match (`#teamsPerMatch`).
2. The user enters the number of teams participating in the tournament (a non-zero power of the `#teamsPerMatch` value)
3. The user clicks the start button.
4. The first round's match-ups are fetched from the server.
5. The winner of a match moves on to the next round and matches up against the adjacent winner(s).
6. Matches are simulated until the winning team is determined.
7. The winning team's name is shown in the UI.

Both teams and matches have scores that are constant for the duration of the tournament. To simulate a match:

1. The teams' scores are fetched from the server.
2. The match's score is fetched from the server.
3. All these scores are sent to the server and it returns the winning team's score.
4. In the event of a tie, the team with the lowest ID wins.

## Running

```
// Node v6+ required
npm install
npm start # Starts the server on port 8765
npm test # Runs the test suite
```

## Server API

### `GET /`

Serves `index.html`.

### `GET /client/*`

Serves resources from the `client` directory.

### `GET /shared/*`

Serves resources from the `shared` directory.

### `POST /tournament`

Creates a tournament and gets the first round's matches.


#### Parameters
| Name            | Type     | Description                                          |
|:----------------|:---------|:-----------------------------------------------------|
| `numberOfTeams` | `number` | Number of teams in the tournament you want to create |
| `teamsPerMatch` | `number` | Number of teams per match                            |

```
$ curl -d numberOfTeams=4&teamsPerMatch=2 http://localhost:8765/tournament
{
  tournamentId: 0,
  matchUps: [{
    match: 0,
    teamIds: [0, 1]
  }, {
    match: 1,
    teamIds: [2, 3]
  }]
}
```

### `GET /team`

Gets team data.

#### Query Parameters
| Name           | Type     | Description  |
|:---------------|:---------|:-------------|
| `tournamentId` | `number` | TournamentID |
| `teamId`       | `number` | Team ID      |

```
$ curl http://localhost:8765/team?tournamentId=0&teamId=0
{
  teamId: 0,
  name: "Camden Wombats",
  score: 8
}
```

### `GET /match`

Gets match data.

#### Query Parameters
| Name           | Type     | Description                         |
|:---------------|:---------|:------------------------------------|
| `tournamentId` | `number` | Tournament ID                       |
| `round`        | `number` | Round of the tournament (0-indexed) |
| `match`        | `number` | Match of the round (0-indexed)      |


```
$ curl http://localhost:8765/match?tournamentId=0&round=0&match=0
{
  score: 67
}
```

### `GET /winner`

Gets the winning score of a match.

#### Query Parameters
| Name           | Type            | Description                      |
|:---------------|:----------------|:---------------------------------|
| `tournamentId` | `number`        | Tournament ID                    |
| `teamScores`   | `Array<number>` | Team scores                      |
| `matchScore`   | `number`        | Score for the match being played |

```
$ curl http://localhost:8765/winner?tournamentId=0&teamScores=8&teamScores=9&matchScore=67
{
  score: 9
}
```
