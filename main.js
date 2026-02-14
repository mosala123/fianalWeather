// main.js - نسخة مبسطة جداً

const API_KEY = '1b4aee5ef4c0949a309e9f08b95aba1f';

// عناصر DOM
const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('searchBtn');
const statusAlert = document.getElementById('statusAlert');
const locationInfo = document.getElementById('locationInfo');
const weatherDesc = document.getElementById('weatherDesc');
const temperature = document.getElementById('temperature');
const humidity = document.getElementById('humidity');
const wind = document.getElementById('wind');
const rain = document.getElementById('rain');
const weatherIcon = document.getElementById('weatherIcon');
const loadingSpinner = document.getElementById('loadingSpinner');

// دالة عرض/إخفاء التحميل
function setLoading(show) {
  loadingSpinner.style.display = show ? 'block' : 'none';
}

// دالة تحديث الواجهة
function updateUI(data, customCity = '') {
  const cityName = customCity || data.name;
  const date = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  
  locationInfo.innerHTML = `<i class="fas fa-map-marker-alt mr-2"></i>${cityName} - ${date}`;
  weatherDesc.textContent = data.weather[0].description;
  temperature.innerHTML = `${Math.round(data.main.temp)}°C`;
  humidity.textContent = `${data.main.humidity}%`;
  wind.textContent = `${(data.wind.speed * 3.6).toFixed(1)} km/h`;
  rain.textContent = data.rain ? `${data.rain['1h'] || 0} mm` : '0%';
  
  // أيقونة بسيطة
  const iconCode = data.weather[0].icon;
  const iconMap = {
    '01d': 'fa-sun', '01n': 'fa-moon',
    '02d': 'fa-cloud-sun', '02n': 'fa-cloud-moon',
    '03d': 'fa-cloud', '03n': 'fa-cloud',
    '04d': 'fa-cloud', '04n': 'fa-cloud',
    '09d': 'fa-cloud-rain', '09n': 'fa-cloud-rain',
    '10d': 'fa-cloud-sun-rain', '10n': 'fa-cloud-moon-rain',
    '11d': 'fa-bolt', '11n': 'fa-bolt',
    '13d': 'fa-snowflake', '13n': 'fa-snowflake',
    '50d': 'fa-smog', '50n': 'fa-smog'
  };
  weatherIcon.className = `fas ${iconMap[iconCode] || 'fa-cloud'} fa-4x`;
  
  setLoading(false);
  statusAlert.className = 'alert alert-success text-center';
  statusAlert.innerHTML = `<i class="fas fa-check-circle mr-2"></i>تم تحديث الطقس لـ ${cityName}`;
}

// دالة جلب البيانات
async function fetchWeather(url, cityName = '') {
  setLoading(true);
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error('المدينة غير موجودة');
    const data = await res.json();
    updateUI(data, cityName);
  } catch (err) {
    setLoading(false);
    statusAlert.className = 'alert alert-danger text-center';
    statusAlert.innerHTML = `<i class="fas fa-exclamation-triangle mr-2"></i>${err.message}`;
  }
}

// البحث عن مدينة
searchBtn.addEventListener('click', () => {
  const city = cityInput.value.trim();
  if (!city) {
    statusAlert.className = 'alert alert-warning text-center';
    statusAlert.innerHTML = '<i class="fas fa-exclamation-circle mr-2"></i>الرجاء إدخال اسم مدينة';
    return;
  }
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`;
  fetchWeather(url, city);
});

cityInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') searchBtn.click();
});

// بدء التطبيق: طلب الموقع
if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const url = `https://api.openweathermap.org/data/2.5/weather?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&appid=${API_KEY}&units=metric`;
      fetchWeather(url);
    },
    () => {
      statusAlert.className = 'alert alert-warning text-center';
      statusAlert.innerHTML = '<i class="fas fa-map-marker-alt mr-2"></i>الرجاء البحث عن مدينة يدوياً';
      setLoading(false);
    }
  );
} else {
  statusAlert.className = 'alert alert-warning text-center';
  statusAlert.innerHTML = '<i class="fas fa-map-marker-alt mr-2"></i>الملاحة غير مدعومة، ابحث يدوياً';
}