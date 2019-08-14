const cityNameList = require('./city_list');
const teamNames = require('./team_names');

class TeamNameGenerator {
  constructor(cityList, teamNameList) {
    this.cityList = cityList;
    this.teamNameList = teamNameList;
  }

  static create() {
    const cityList = new RandomizedList(cityNameList);
    const teamNameList = new RandomizedList(teamNames);
    return new TeamNameGenerator(cityList, teamNameList);
  }

  next() {
    return `${this.cityList.next()} ${this.teamNameList.next()}`;
  }
}

class RandomizedList {
  constructor(srcList) {
    this.list = [];
    this.srcList = srcList;
  }

  next() {
    if (this.list.length === 0) {
      this.list = this.srcList.slice();
    }

    const randomIndex = Math.floor(Math.random() * this.list.length);
    return this.list.splice(randomIndex, 1)[0];
  }
}

module.exports = TeamNameGenerator;
