var path = require('path');

module.exports = function(data) {
    var action = data.action;
    var lang = data.lang || 'ua';
    
    var keyName = (lang === 'en') ? 'nameUS' : 'nameUA';
    var sortLocale = (lang === 'en') ? 'en' : 'uk';

    try {
        if (action === 'get_config') {
            var configPath = path.join(__dirname, 'question_config.json');
            var rawConfig = require(configPath);
            var conf = rawConfig[lang] || rawConfig['ua'];
            
            data.config = {
                txt_start: conf.start_msg,
                txt_select_country: conf.select_country_msg,
                txt_select_city: conf.select_city_msg,
                txt_date: conf.select_date_msg,
                txt_time: conf.select_time_msg,
                txt_city_letter: conf.select_city_letter_msg,
                txt_country_letter: conf.select_country_letter_msg,
                txt_weather: conf.weather_msg
            };

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
            var countryPath = path.join(__dirname, 'country.json');
            var countries = require(countryPath);
            var countryCode = data.country_code;

            var currentCountry = countries.find(function(c) {
                return c.code === countryCode;
            });

            if (currentCountry) {
                data.country_name = currentCountry[keyName];
            }

            var cityPath = path.join(__dirname, 'city.json');
            var cities = require(cityPath);
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
                return {
                    "name": city[keyName],
                    "name_en": city.nameUS, 
                    "country_code": city.code
                };
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
