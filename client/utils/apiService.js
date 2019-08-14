var tournamentModule = tournamentModule || {};

tournamentModule.ApiRequest = (function () {

  function parseJSON(response) {
    return response.json();
  }

  var request = function (url, payload, method) {
    let options = {
      credentials: 'same-origin',
    };
    if (payload) {
      let data;
      let contentType;
      let settings = {}
      if (method.toUpperCase() == 'GET') {
        settings = {
          method: method.toUpperCase(),
        };
        url = url + '?' + (Object.keys(payload).map(function (key) {
          if (payload[key].constructor === Array) {
            return (payload[key].map(function (value) {
              return encodeURIComponent(key) + '=' + encodeURIComponent(value)
            }).join('&'));
          }
          return encodeURIComponent(key) + '=' + encodeURIComponent(payload[key])
        }).join('&'));
      } else {
        data = Object.keys(payload).map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(payload[key])}`).join('&');
        contentType = 'application/x-www-form-urlencoded;charset=UTF-8';
        settings = {
          method: method,
          headers: {
            "Content-type": contentType
          },
          body: data
        };
      }

      Object.assign(options, settings);
    }

    return fetch(url, options)
      .then(parseJSON)
      .catch((error) => {
        console.error('API Error: ', error);
      });
  }

  return {
    request: request
  }
})();
