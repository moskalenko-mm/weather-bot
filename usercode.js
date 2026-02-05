module.exports = function(data) {
    var action = data.action; 
    var lang = data.lang || 'ua';
    
    var keyName = (lang === 'en') ? 'nameUS' : 'nameUA';
    
    var sortLocale = (lang === 'en') ? 'en' : 'uk';

    if (action === 'get_config') {
        try {
            var config = require('./question_config.json');
            return { "result": config[lang] || config['ua'] };
        } catch (e) { return { "error": "Config not found" }; }
    }

    if (action === 'get_letters') {
        var countries = require('./country.json');
        var letters = [];
        
        countries.forEach(function(c) {
            var name = c[keyName];
            if (name) {
                var firstChar = name.charAt(0).toUpperCase();
                if (letters.indexOf(firstChar) === -1) letters.push(firstChar);
            }
        });
        
        letters.sort(function(a, b) {
            return a.localeCompare(b, sortLocale);
        });
        
        return { "letters": letters };
    }

    if (action === 'get_countries') {
        var countries = require('./country.json');
        var letter = data.letter; 
        
        var filtered = countries.filter(function(c) {
            return c[keyName] && c[keyName].startsWith(letter);
        });

        var result = filtered.map(function(c) {
            return { "name": c[keyName], "code": c.code };
        });
        
        result.sort(function(a, b) {
            return a.name.localeCompare(b.name, sortLocale);
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
            var name = city[keyName];
            if (name) {
                var firstChar = name.charAt(0).toUpperCase();
                if (cityLetters.indexOf(firstChar) === -1) {
                    cityLetters.push(firstChar);
                }
            }
        });
        
        cityLetters.sort(function(a, b) {
            return a.localeCompare(b, sortLocale);
        });
        
        return { "letters": cityLetters };
    }

    if (action === 'get_cities') {
        var cities = require('./city.json');
        var countryCode = data.country_code;
        var letter = data.letter;

        var filtered = cities.filter(function(city) {
            return city.code === countryCode && city[keyName] && city[keyName].startsWith(letter);
        });

        var result = filtered.map(function(city) {
            return {
                "name": city[keyName],
                "country_code": city.code
            };
        });
        
        result.sort(function(a, b) {
            return a.name.localeCompare(b.name, sortLocale);
        });

        return { "cities": result };
    }

    return { "error": "Unknown action: " + action };
};
