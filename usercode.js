exports.usercode = function(data) {
    var action = data.action;
    var lang = data.lang || 'ua';
    var keyName = (lang === 'en') ? 'nameUS' : 'nameUA';


    if (action === 'get_config') {
        var config = require('./question_config.json');
        return { "result": config[lang] || config['ua'] };
    }


    if (action === 'get_letters') {
        var countries = require('./country.json');
        var letters = [];
        
        countries.forEach(function(c) {
            var firstChar = c[keyName].charAt(0).toUpperCase();
            if (letters.indexOf(firstChar) === -1) letters.push(firstChar);
        });
        letters.sort();
        return { "letters": letters };
    }


    if (action === 'get_countries') {
        var countries = require('./country.json');
        var letter = data.letter; 
        
        var filtered = countries.filter(function(c) {
            return c[keyName].startsWith(letter);
        });

        var result = filtered.map(function(c) {
            return { "name": c[keyName], "code": c.code };
        });
        return { "countries": result };
    }


    if (action === 'get_city_letters') {
        var cities = require('./city.json');
        var countryCode = data.country_code;
        var cityLetters = [];

    
        var countryCities = cities.filter(function(city) {
            return city.code === countryCode;
        });

   
        countryCities.forEach(function(city) {
            var firstChar = city[keyName].charAt(0).toUpperCase();
            if (cityLetters.indexOf(firstChar) === -1) {
                cityLetters.push(firstChar);
            }
        });
        
        cityLetters.sort();
        return { "letters": cityLetters };
    }


    if (action === 'get_cities') {
        var cities = require('./city.json');
        var countryCode = data.country_code;
        var letter = data.letter;

        var filtered = cities.filter(function(city) {

            return city.code === countryCode && city[keyName].startsWith(letter);
        });

        var result = filtered.map(function(city) {
            return {
                "name": city[keyName],
                "country_code": city.code 
            };
        });

        return { "cities": result };
    }

    return { "error": "Unknown action" };
};
