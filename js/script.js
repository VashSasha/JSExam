/**
 * date: 01/10/2021
 * v.5
 * name: Vashchuk Oleksandr
 */

'use strict'
class WeatherCheck {
    constructor() {
        this.APIKey = '2a423985a3a7232f530cc8c2f20638e1'
        this.main = document.querySelector('main')
    }

    async search(name, country) {
        /**
         * Getting information of the searched city/country, such as:
         * lon, lat; today's weather, clouds, timezone, etc.;
         */
        try {
            const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${name},${country}&units=metric&lang=en_ru_ua&appid=${this.APIKey}`);
            const data = await response.json();
            if (data.message == 'city not found') {
                this.notFound(name);
                throw new Error('city not found');
            }
            return data;
        } catch (error) {
            console.log(error)
        }
    }
    async searhc_hourly(lat, lon) {
        /**
         * By using the lon and lat data from the previous API Call, we are getting hourly weather data for today.
         */
        try {
            const response = await fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&units=metric&appid=${this.APIKey}`);
            const data = await response.json();
            if (data.message == 'city not found') {
                this.notFound();
                throw new Error('city not found');
            }
            return data;
        } catch (error) {
            console.log(error)
        }
    }


    async search_nearByCities(lat, lon) {
        /**
         * With this API call we are getting information of the near by cities.
         */
        let url = `https://api.openweathermap.org/data/2.5/find?lat=${lat}&lon=${lon}&cnt=5&units=metric&appid=${this.APIKey}`
        try {
            const response = await fetch(url);
            const data = await response.json();

            return data;
        } catch (error) {
            console.log(error)
        }
    }

    async search_fiveDays(name) {
        /**
         * With this API call we are getting information for five days forcast. (with 3h apart).
         */
        try {
            const response = await fetch(`http:///api.openweathermap.org/data/2.5/forecast?q=${name}&lang=en_ru_ua&units=metric&appid=${this.APIKey}`);
            const data = await response.json();
            if (data.message == 'city not found') {
                this.notFound(name);
                throw new Error('city not found');
            }
            return data;
        } catch (error) {
            this.notFound(name)
        }
    }

    delElement(classEl) {
        const el = document.querySelectorAll(classEl);
        if (el) {
            for (let item of el)
                item.remove();
        }
    }

    notFound(name) {
        /** 
         * 404 Error page.
        */
        let errorMesage = `
        <div class="error-wrap">  
            <img src="./img/404.png" alt=""> 
            <h2><span class="error-input">${name}</span> Could not be found</h2>
            <p>Please enter a different location</p>
        </div>
        `
        let block = document.createElement('div');
        block.classList.add('block');
        block.innerHTML = errorMesage;

        this.delElement('.block')
        this.delElement('.days')
        this.main.append(block)
    }

}

class WeatherGenerator {
    constructor() {
        this.main = document.querySelector('main')
        this.search = document.querySelector('#search');
        this.searchInpt = document.querySelector('#search').placeholder;
        this.active = document.querySelector('.li_active');
        this.currentData;
        this.init();
    }

    getUserLoc() {
        /***
         * I used jQuery because the source that provides this information recomended this way of executing.
         */
        $.get("https://ipinfo.io?token=ad53e3139d44f3", response => {
            if (response) { return this.searchCity(response.city); }
            else { return this.searchCity('kyiv') }
        }, "jsonp")

    }
    addElement(tag, content, classEl, parent) {
        const el = document.createElement(tag);
        el.innerHTML = content;
        el.className = classEl;
        parent.append(el);
    }

    delElement(classEl) {
        const el = document.querySelectorAll(classEl);
        if (el) {
            for (let item of el)
                item.remove();
        }
    }

    showDate(type, d) {
        /***
         *  type -  is for different tipes of date;
         *  d - is a date string; (2021-01-10 21:00:00)
         */
        let nd = new Date(d)
        switch (type) {
            case 'date':
                let date = new Date();
                return date.toLocaleString('en-US', {
                    year: 'numeric',
                    month: 'numeric',
                    day: 'numeric'
                })
            case 'wd':
                return nd.toLocaleString('en-US', { weekday: 'short' })
            case 'mnS':
                return nd.toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric'
                })
        }

    }
    roundUp(num) {
        return Math.floor(num)
    }

    msToKmh(speed) {
         /**
         * converting miles per hour to km per hour
         */
        return (speed * 18) / 5
    }
    
    degToDirection(num) {
        let val = Math.floor((num / 22.5) + 0.5);
        let arr = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
        return arr[(val % 16)];
    }
    unixConverter(timeCode, type) {
        let offset = this.offset
        let d = new Date((timeCode + offset) * 1000);
        let d1 = new Date()
        d1.setHours(d.getUTCHours())
        d1.setMinutes(d.getUTCMinutes())
        switch (type) {
            case 'date':
                return d1.toLocaleString(('en-US'), {
                    day: 'numeric',
                    month: 'numeric',
                    year: 'numeric'
                })
            case 'timeL':
                return d1.toLocaleString(('en-US'), {
                    hour: 'numeric',
                    minute: 'numeric'
                })
            case 'timeSh':
                return d1.toLocaleString('en-US', { hour: 'numeric', hour12: true })
        }
    }
    getCurrent(data) {
        // console.log(data)
        this.offset = data.timezone;
        let sunrise = this.unixConverter(data.sys.sunrise, 'timeL');
        let sunset = this.unixConverter(data.sys.sunset, 'timeL');
        let content = `
        <div class="block_header">
            <h3>current Weather</h3>
            <span>${this.showDate('date')}</span>
        </div>
        <div class="content">
            <div class="icon">
                <img src="./img/${data.weather[0].icon}.png" alt="">
                <p>${data.weather[0].main}</p>
            </div>
            <div class="temp">
                <p class="temp_lg">${this.roundUp(data.main.temp)}ºC</p>
                <p>Real feel ${this.roundUp(data.main.feels_like)}º</p>
            </div>
            <div class="dayLight">

                <ul>
                    <li>Sunrise: <span>${sunrise}</span></li>
                    <li>Sunset:<span>${sunset}</span></li>
                    
                </ul>
            </div>
        </div>
        `;
        // <li>Duration:<span> ${sunset-sunrise}hr</span></li>
        this.delElement('.days');
        this.delElement('.block');
        this.addElement('div', content, 'block', this.main);
    }
    getHourly(data, type) {
        let block2 = document.createElement('div');
        block2.classList.add('block');

        let content = `
        <div class="block_header">
            <h3>hourly</h3>
        </div>
        `
        console.log(data)
        // let d = this.unixConverter(data.current.dt, 'date');

        let grid_content = `
            <div class="col">
                <div class="uppercase"><h4>Day</h4></div>
                <div class="h_icons"><img src="./img/blank.png" alt=""></div>
                <div class="f_header lght bd_bt">Forcast</div>
                <div class="f_header lght bd_bt">Temp(ºC)</div>
                <div class="f_header lght bd_bt">RealFeel</div>
                <div class="f_header lght">Wind</div>
            </div>
        `;
        let fill = grid_content

        data.length = data.length ? data.length : 6;

        for (let i = 0; i < data.length; i++) {
            switch (type) {
                case 'five':

                    grid_content = `
                    <div class="col">
                        <div>${this.unixConverter(data[i].dt, 'timeSh')}</div>
                        <div class="h_icons"><img src="./img/${data[i].weather[0].icon}.png" alt=""></div>
                        <div class="bd_bt">${data[i].weather[0].main}</div>
                        <div class="bd_bt">${this.roundUp(data[i].main.temp)}º</div>
                        <div class="bd_bt">${this.roundUp(data[i].main.feels_like)}º</div>
                        <div>${this.roundUp(this.msToKmh(data[i].wind.speed))} ${this.degToDirection(data[i].wind.deg)}</div>
                    </div>
                `
                    break;
                case 'curr':
                    grid_content = `
                    <div class="col">
                        <div>${this.unixConverter(data.hourly[i].dt, 'timeSh')}</div>
                        <div class="h_icons"><img src="./img/${data.hourly[i].weather[0].icon}.png" alt=""></div>
                        <div class="bd_bt">${data.hourly[i].weather[0].main}</div>
                        <div class="bd_bt">${this.roundUp(data.hourly[i].temp)}º</div>
                        <div class="bd_bt">${this.roundUp(data.hourly[i].feels_like)}º</div>
                        <div>${this.roundUp(this.msToKmh(data.hourly[i].wind_speed))} ${this.degToDirection(data.hourly[i].wind_deg)}</div>
                    </div>
                `
                    break;
            }
            fill += grid_content
        }
        block2.innerHTML = content
        this.addElement('div', fill, 'grid', block2)
        this.main.append(block2);

        this.currentData = data

    }
    nearByCities(info) {
        // console.log(info)
        let div = document.createElement('div');
        div.classList.add('block')

        let wrap = document.createElement('div');
        wrap.classList.add('wrap');

        let header = `
        <div class="block_header">
            <h3>nearby places</h3>
         </div>
        `
        let content = ''
        for (let i = 1; i < 5; i++) {
            let city = info.list[i];
            content += `
                <div class="item">
                    <div>${city.name}</div>
                    <div class="h_icons"><img src="./img/${city.weather[0].icon}.png" alt=""></div>
                    <div class="bd_bt">${this.roundUp(city.main.temp)}Cº</div>
                </div>
            `
        }
        div.innerHTML = header;
        wrap.innerHTML = content
        div.append(wrap)
        this.main.append(div)

    }

    fiveDaysForecast(data) {
        // this.currentData.current.dt_txt = this.showDate('date', this.unixConverter(this.currentData.current, 'date'))

        let div = document.createElement('div');
        div.classList.add('days')

        let content = '';
        const every_nth = (arr, nth) => arr.filter((e, i) => i % nth === nth - 1);
        let newArr = every_nth(data.list, 8)
        newArr.unshift(data.list[0])
        // console.log(newArr)

        for (let i = 0; i < 5; i++) {
            let d = newArr[i].dt_txt
            content += `
            <div class="item" data-id="${d.split(' ')[0]}" data-wd="${this.showDate('wd', d)}">
                <h4 class="block_header">${this.showDate('wd', d)}</h4>
                <p class="lght">${this.showDate('mnS', d)}</p>
                <img src="./img/${newArr[i].weather[0].icon}.png" alt="">
                <p class="text_lg">${this.roundUp(newArr[i].main.temp)}ºC</p>
                <p class="lght">${newArr[i].weather[0].main}</p>
            </div>
            `
        }
        this.addElement('div', content, '.days', div)
        div.innerHTML = content;
        this.main.append(div)

        // this.getHourly(newArr[0],'five')

        let items = document.querySelector('.days');
        let item = items.firstElementChild;
        item.classList.add('active')
        let arr = [];

        for (let d of data.list) {
            if (d.dt_txt.includes(item.dataset.id)) {
                arr.push(d);
            }
        }
        console.log(arr.length)
        // console.log(arr)
        if (arr.length < 6) {
            for (let i = arr.length; i < 9; i++) {
                arr.push(data.list[i])
            }
        }
        console.log(arr)
        let genArr = (e) => {

            $('.active').removeClass('active');
            if (e.target !== undefined) {
                item = e.target.closest('.item');
                item.classList.add('active');
            }
            this.delElement('.block');

            arr = []; //reset the array

            // console.log(this.currentData)
            // console.log(data)

            for (let d of data.list) {
                if (d.dt_txt.includes(item.dataset.id)) {
                    arr.push(d);

                }
            }

            if (arr.length < 6) {
                for (let i = arr.length; i < 9; i++) {
                    arr.push(data.list[i])
                }
            }
            arr = arr.slice(0, 6)
            console.log(arr.length)
            this.getHourly(arr, 'five')
        }

        arr = arr.slice(0, 6)
        console.log(arr)
        this.getHourly(arr, 'five')

        items.addEventListener('click', genArr)
    }

    showWeather(data) {
        console.log(data)
        this.getCurrent(data);

        new WeatherCheck().searhc_hourly(data.coord.lat, data.coord.lon)
            .then(info => this.getHourly(info, 'curr'))


        new WeatherCheck().search_nearByCities(data.coord.lat, data.coord.lon)
            .then(info => this.nearByCities(info));
    }

    searchFive(name) {
        this.name = name
        new WeatherCheck().search_fiveDays(this.name)
            .then(data => this.fiveDaysForecast(data))
            .catch(error => console.log(error))
    }

    searchCity(name) {
        this.name = name
        this.search.placeholder = this.name;
        const searchedCity = new WeatherCheck();

        searchedCity.search(this.name)
            .then(data => this.showWeather(data))
            .catch(error => console.log(error));

    }
    activeTabLinks(link){
        if (link) {
             console.log(link)
            this.active.classList.remove('li_active');
    
            if (link.dataset.id == 'today') {
                link.classList.add('li_active');
                this.delElement('.days')
                this.searchCity(this.name)

            } else if (link.dataset.id == 'five-days') {
                link.classList.add('li_active')

                this.delElement('.block')
                this.delElement('.days')
                this.searchFive(this.name)
            }
        }
    }
    init() {
        this.icon = document.querySelector('#search_icon');
        this.tabs = document.querySelector('#tabs')
        this.grid = document.querySelector('#grid')

        console.log()
        this.search.addEventListener('keyup', (e) => {
            if (e.keyCode === 13) {
                e.preventDefault();
                this.searchCity(this.search.value);
                console.log(this.active)
                this.active.classList.remove('li_active');
            }
        })

        this.icon.addEventListener('click', (e) => {
            e.preventDefault();
            if (this.search.value == '') {
                alert('enter a city')
            } else {
                this.searchCity(this.search.value);
            }
        })
        this.tabs.addEventListener('click', (e) => {
            let link = e.target.closest('.pages');
            this.activeTabLinks(link);

        })
    }

}

// 
const newLoc = new WeatherGenerator().getUserLoc();
// const newLoc = new WeatherGenerator();