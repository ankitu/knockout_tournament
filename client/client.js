var tournamentModule = tournamentModule || {};

window.addEventListener('load', () => {
  new tournamentModule.App.Tournament('start', tournamentModule.ApiRequest, tournamentModule.ApiPath)
});