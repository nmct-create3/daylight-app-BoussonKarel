plet htmlBody, htmlLocation, htmlTimeLeft, htmlSunrise, htmlSunset, htmlSun;

// _ = helper functions
const _parseMillisecondsIntoReadableTime = function (timestamp) {
    //Get hours from milliseconds
    const date = new Date(timestamp * 1000);
    // Hours part from the timestamp
    const hours = '0' + date.getHours();
    // Minutes part from the timestamp
    const minutes = '0' + date.getMinutes();
    // Seconds part from the timestamp (gebruiken we nu niet)
    // const seconds = '0' + date.getSeconds();

    // Will display time in 10:30(:23) format
    return hours.substr(-2) + ':' + minutes.substr(-2); //  + ':' + s
};

// 5 TODO: maak updateSun functie
const updateSun = function (left, bottom, now) {
    htmlSun.style.left = `${left}%`;
    htmlSun.style.bottom = `${bottom}%`;

    const hours = '0' + now.getHours();
    const minutes = '0' + now.getMinutes();
    const currentTimeStamp = hours.substr(-2) + ':' + minutes.substr(-2); //  + ':' + s

    htmlSun.setAttribute('data-time', currentTimeStamp);
};

// 4 Zet de zon op de juiste plaats en zorg ervoor dat dit iedere minuut gebeurt.
const placeSunAndStartMoving = (totalMinutes, sunrise) => {
    // In de functie moeten we eerst wat zaken ophalen en berekenen.
    // Haal het DOM element van onze zon op en van onze aantal minuten resterend deze dag.
    // Bepaal het aantal minuten dat de zon al op is.
    const now = new Date();
    const sunriseDate = new Date(sunrise * 1000);

    const minutesSunUp =
        now.getHours() * 60 +
        now.getMinutes() -
        (sunriseDate.getHours() * 60 + sunriseDate.getMinutes());

    // Nu zetten we de zon op de initiële goede positie ( met de functie updateSun ). Bereken hiervoor hoeveel procent er van de totale zon-tijd al voorbij is.
    const percentage = (100 / totalMinutes) * minutesSunUp,
        sunLeft = percentage,
        sunBottom = percentage < 50 ? percentage * 2 : (100 - percentage) * 2;
    updateSun(sunLeft, sunBottom, now);

    // We voegen ook de 'is-loaded' class toe aan de body-tag.
    htmlBody.classList.add('is-loaded');
    // Vergeet niet om het resterende aantal minuten in te vullen.
    htmlTimeLeft.innerText = Math.round(totalMinutes - minutesSunUp);
    // Nu maken we een functie die de zon elke minuut zal updaten
    const t = setInterval(() => {
        if (minutesSunUp > totalMinutes) {
            // Zon nog niet op of al onder
            clearInterval(t);
            // TODO: Enable night mode
        } else if (minutesSunUp < 0) {
            // TODO: Enable night mode
        } else {
            const now = new Date(),
                left = (100 / totalMinutes) * minutesSunUp,
				bottom = left < 50 ? left * 2 : (100 - left) * 2;
			
			minutesSunUp++;
			updateSun(left, bottom, now);

			htmlTimeLeft.innerText = totalMinutes - minutesSunUp;
        }
    }, 60000);
    // Bekijk of de zon niet nog onder of reeds onder is
    // Anders kunnen we huidige waarden evalueren en de zon updaten via de updateSun functie.
    // PS.: vergeet weer niet om het resterend aantal minuten te updaten en verhoog het aantal verstreken minuten.
};

// 3 Met de data van de API kunnen we de app opvullen
const showResult = (queryResponse) => {
    console.log(queryResponse);
    // We gaan eerst een paar onderdelen opvullen
    // Zorg dat de juiste locatie weergegeven wordt, volgens wat je uit de API terug krijgt.
    htmlLocation.innerText = `${queryResponse.city.name}, ${queryResponse.city.country}`;
    // Toon ook de juiste tijd voor de opkomst van de zon en de zonsondergang.
    htmlSunrise.innerText = _parseMillisecondsIntoReadableTime(
        queryResponse.city.sunrise
    );
    htmlSunset.innerText = _parseMillisecondsIntoReadableTime(
        queryResponse.city.sunset
    );
    // Hier gaan we een functie oproepen die de zon een bepaalde positie kan geven en dit kan updaten.
    // Geef deze functie de periode tussen sunrise en sunset mee en het tijdstip van sunrise.

    const timeDiff =
        (queryResponse.city.sunset - queryResponse.city.sunrise) / 60; // aantal minuten
    placeSunAndStartMoving(timeDiff, queryResponse.city.sunrise);
};

// 2 Aan de hand van een longitude en latitude gaan we de yahoo wheater API ophalen.
const getAPI = async (lat, lon) => {
    // Eerst bouwen we onze url op
    // Met de fetch API proberen we de data op te halen.
    // Als dat gelukt is, gaan we naar onze showResult functie.
    const endpoint = `http://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=0d83dff417d181fcf3def092e000cdf6&units=metric&lang=nl&cnt=1`;

    const data = await fetch(endpoint)
        .then((r) => r.json())
        .catch((err) => console.error('An error occured', err));
    showResult(data);
};

document.addEventListener('DOMContentLoaded', function () {
    htmlBody = document.querySelector('body');
    htmlLocation = document.querySelector('.js-location');
    htmlTimeLeft = document.querySelector('.js-time-left');
    htmlSunrise = document.querySelector('.js-sunrise');
    htmlSunset = document.querySelector('.js-sunset');
    htmlSun = document.querySelector('.js-sun');

    // 1 We will query the API with longitude and latitude.
    getAPI(50.8027841, 3.2097454);
});
