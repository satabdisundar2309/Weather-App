const userTab = document.querySelector("[data-userWeather]")
const searchTab = document.querySelector("[data-searchWeather]")
const weatherContainer = document.querySelector("[weather-container]")

const grantAccessContainer = document.querySelector(".grant-location-container")
const searchForm = document.querySelector("[data-searchForm]")
const loadingScreen = document.querySelector(".loading-container")
const userInfoContainer = document.querySelector(".user-info-container")
const grantAccessButton = document.querySelector("[data-grantAccess]")
const searchInput = document.querySelector("[data-searchInput]")

const notFound = document.querySelector('.errorContainer');
const errorBtn = document.querySelector('[data-errorButton]');
const errorText = document.querySelector('[data-errorText]');
const errorImage = document.querySelector('[data-errorImg]');

// setting some default val;ues which will work when app is opened
let currentTab= userTab;
const API_KEY = "168771779c71f3d64106d8a88376808a";
currentTab.classList.add("current-tab");
getFromSessionStorage();


function switchTab(clickedTab){
     notFound.classList.remove("active");
    if(clickedTab != currentTab){
        currentTab.classList.remove("current-tab");
        currentTab=clickedTab
        clickedTab.classList.add("current-tab");
        
        if(!searchForm.classList.contains("active")){
            searchForm.classList.add("active")
            userInfoContainer.classList.remove("active")
            grantAccessContainer.classList.remove("active")
            
        }
        else{
            // if initially present in search tab
            searchForm.classList.remove("active")
            userInfoContainer.classList.remove("active")
            // grantAccessContainer.classList.remove("active")
            getFromSessionStorage();
        }
    }
    
}

userTab.addEventListener("click",()=>{
    // passing clicked tab as input
    switchTab(userTab)
})
searchTab.addEventListener("click",()=>{
    // passing clicked tab as input
    switchTab(searchTab)
})

// checks if coordinates are alraedy store in session storage
function getFromSessionStorage(){
    const localCoordinates = sessionStorage.getItem("user-coordinates");
    if(!localCoordinates){
        // if local coordinates are not found
        grantAccessContainer.classList.add("active");
    }
    else{
        const coordinates = JSON.parse(localCoordinates);
        fetchUserWeatherInfo(coordinates);
    }
}
async function fetchUserWeatherInfo(coordinates){
    const {lat, lon} = coordinates;
    // make grant container invisible
    grantAccessContainer.classList.remove("active")
    // make loader visible
    loadingScreen.classList.add("active")
    // API call
    try{
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`);
        const data = await response.json();
        if (!data.sys) {
            throw data;
        }
        loadingScreen.classList.remove("active")
        userInfoContainer.classList.add("active")
        renderWeatherInfo(data);
    }
    catch(err){
        loadingScreen.classList.remove("active")
        notFound.classList.add('active');
        errorImage.style.display = 'none';
        errorText.innerText = `Error: ${err?.message}`;
        errorBtn.style.display = 'block';
        errorBtn.addEventListener("click", fetchWeatherInfo);
    }

}
function renderWeatherInfo(weatherInfo){
    // first let me fetch the elements
    const cityName = document.querySelector("[data-cityName]")
    const countryIcon = document.querySelector("[data-countryIcon]")
    const desc = document.querySelector("[data-weatherDesc]")
    const weatherIcon = document.querySelector("[data-weatherIcon]")
    const temp = document.querySelector("[data-temp]")
    const humidity= document.querySelector("[data-humidity]")
    const windspeed = document.querySelector("[data-windspeed]")
    const cloudiness = document.querySelector("[data-cloudiness]")
    
    // fetch values from weatherInfo object and put it in UI elements
    cityName.innerText = weatherInfo?.name;
    countryIcon.src = `https://flagcdn.com/144x108/${weatherInfo?.sys?.country.toLowerCase()}.png`
    desc.innerText= weatherInfo?.weather?.[0]?.description;
    weatherIcon.src = `http://openweathermap.org/img/w/${weatherInfo?.weather?.[0]?.icon}.png`;
    temp.innerText= `${weatherInfo?.main?.temp} °C`;
    humidity.innerText=`${weatherInfo?.main?.humidity}%`;
    windspeed.innerText=`${weatherInfo?.wind?.speed}M/S`;
    cloudiness.innerText=`${weatherInfo?.clouds?.all}%`;
}




// getLocation function
function getLocation() {
    if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showPosition);
    } else {
    alert("Geolocation is not supported by this browser.");
    }
    }
    
    function showPosition(position) {
        const userCoordinates={
            lat: position.coords.latitude,
            lon: position.coords.longitude
        }
        sessionStorage.setItem("user-coordinates", JSON.stringify(userCoordinates))
        fetchUserWeatherInfo(userCoordinates);
    }
// adding event listner on grant access button
grantAccessButton.addEventListener("click",getLocation)


// adding event listener on search button
searchForm.addEventListener("submit", (e)=>{
    e.preventDefault();
    let city = searchInput.value;
    if(city===""){
        return;
    }
    else{
        fetchSearchWeatherInfo(city);
        searchInput.value="";
    }
})
async function  fetchSearchWeatherInfo(city){
    loadingScreen.classList.add("active")
    userInfoContainer.classList.remove("active")
    grantAccessContainer.classList.remove("active")
    try{
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`);
        const data= await response.json();
        if (!data.sys) {
            throw data;
        }
        loadingScreen.classList.remove("active")
        userInfoContainer.classList.add("active")
        renderWeatherInfo(data);
    }
    catch(err){
        loadingScreen.classList.remove("active");
        userInfoContainer.classList.remove("active");
        notFound.classList.add("active");
        errorText.innerText = `City Not Found`;
        errorBtn.style.display = "none";
    }
}