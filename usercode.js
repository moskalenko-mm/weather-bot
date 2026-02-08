var path = require('path');

// ПРИБРАЛИ callback з аргументів
module.exports = function(data) {
    var action = data.action;
    var lang = data.lang || 'ua';
    
    var keyName = (lang === 'en') ? 'nameUS' : 'nameUA';
    var sortLocale = (lang === 'en') ? 'en' : 'uk';

    try {
        if (action === 'get_config') {
            var configPath = path.join(__dirname, 'question_config.json');
            var config = require(configPath);
            
            var configData = config[lang] || config['ua'];
            
            data.txt_start = configData.start_msg;
            data.txt_select_country = configData.select_country_msg;
            data.txt_select_city = configData.select_city_msg;
            data.txt_date = configData.select_date_msg;
            data.txt_time = configData.select_time_msg;

        } else if (action === 'get_letters') {
            var countryPath = path.join(__dirname, 'country.json');
            var countries = require(countryPath);
            var letters = [];
            
            countries.forEach(function(c) {
                var name = c[keyName];
                if (name) {
                    var firstChar = name.charAt(0).toUpperCase();
                    if (letters.indexOf(firstChar) === -1) letters.push(firstChar);
                }
            });
            letters.sort(function(a, b) { return a.localeCompare(b, sortLocale); });
            data.letters = letters;

        } else if (action === 'get_countries') {
            var countryPath = path.join(__dirname, 'country.json');
            var countries = require(countryPath);
            var letter = data.letter; 
            
            var filtered = countries.filter(function(c) {
                return c[keyName] && c[keyName].startsWith(letter);
            });
            var result = filtered.map(function(c) {
                return { "name": c[keyName], "code": c.code };
            });
            result.sort(function(a, b) { return a.name.localeCompare(b.name, sortLocale); });
            data.countries = result;

        } else if (action === 'get_city_letters') {
            var cityPath = path.join(__dirname, 'city.json');
            var cities = require(cityPath);
            var countryCode = data.country_code;
            var cityLetters = [];

            var countryCities = cities.filter(function(city) {
                return city.code === countryCode;
            });
            countryCities.forEach(function(city) {
                var name = city[keyName];
                if (name) {
                    var firstChar = name.charAt(0).toUpperCase();
                    if (cityLetters.indexOf(firstChar) === -1) cityLetters.push(firstChar);
                }
            });
            cityLetters.sort(function(a, b) { return a.localeCompare(b, sortLocale); });
            data.letters = cityLetters;

        } else if (action === 'get_cities') {
            var cityPath = path.join(__dirname, 'city.json');
            var cities = require(cityPath);
            var countryCode = data.country_code;
            var letter = data.letter;

            var filtered = cities.filter(function(city) {
                return city.code === countryCode && city[keyName] && city[keyName].startsWith(letter);
            });
            var result = filtered.map(function(city) {
                return { "name": city[keyName], "country_code": city.code };
            });
            result.sort(function(a, b) { return a.name.localeCompare(b.name, sortLocale); });
            data.cities = result;
        }

        return data;

    } catch (e) {
        data.git_error = e.toString();
        return data;
    }
};
