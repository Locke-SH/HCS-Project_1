let form_ids= ["city_name","country_name","arrival_date","departure_date","description"];
let url="http://localhost:3000/locations/";
let initialLoad = true;
let ApiKey = "";
let weatherObject;

function getWeatherData(city){
  var url=`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${ApiKey}&units=metric&lang=de`;

  fetch(url)
    .then(response => {
      if (response.ok) {
        return response.json();
      } else {
        return Promise.reject(response.status);
      }
    })
     .then(json => {
     let iconUrl="http://openweathermap.org/img/wn/"+json.weather[0].icon+".png";
     let x = document.getElementById("weather-"+json.name)
     x.innerHTML =`<b>Actual weather:</b> in ${json.name} <img src=${iconUrl}> with ${json.main.temp}º Celsius`
     })
    .catch(error => {
      switch (error) {
        case 404:
          alert("Incorrect city!");
          break;
        case 401:
          alert("Invalid API key!");
          break;
        default:
          console.log(error);
          alert("An error has occurred - please try again later!");
      }})
  }

function clearBlogEntries(){
  let node = document.getElementById("blog_entries");
  if (node){
  while (node.lastElementChild) {
    node.removeChild(node.lastElementChild);}
  }
 }

function clearForm(){
    for (x of form_ids){
        document.getElementById(x).value = "";
}}

function handleEntrieData(){
    let form_values=[];
    for (x of form_ids){
        form_values.push(document.getElementById(x).value)
    }
    clearBlogEntries();
    saveToJson(form_values);
    getDataFromApi();
    clearForm();
  
    document.getElementById("input_form").style.display = "none";
}

//Info: inital ID gets handled by JSON_server

function saveToJson(form_values, APImethod = "POST", id=null) {

  let location = {
        "id": "",
        "city": form_values[0],
        "country": form_values[1],
        "vistited_from": form_values[2],
        "visited_to": form_values[3],
        "description": form_values[4]
    }

    if (APImethod === "PUT") {
      url = url+id
      location["id"]= id
    }

    fetch(url, {
        method: APImethod,
        headers : {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body : JSON.stringify(location)
      })
      .then(response => {
        if (response.ok) {
          return response.json();
        } else {
          return Promise.reject(response.status);
        }
      })
      .catch(error => {
        console.log("An error occurred: "+error);
      });
  }


function deleteData(id){
  let idNumber = id.split("_")
  console.log(idNumber[1])
  alert("Sure you want to delete?");
  fetch(url + idNumber[1], {
    method: "DELETE",
  });
  clearBlogEntries()
  getDataFromApi()
}

function getDataFromApi(){
  fetch(url)
      .then(response => response.json())
      .then (json => {
        addContentToHtml(json)
        addFormEvents() 
 })
}

function addContentToHtml(data){
  for (x of data) {
      getWeatherData(String(x.city) + ", " + String(x.country));
      var grid = document.getElementById("blog_entries")
      var el = document.createElement('div');
      el.classList.add('container','border' ,'m-5');
      el.id = x.id;
      el.innerHTML = `<p class="text-nowrap"><b>City:</b>
                      <div id="city">${x.city}</div></p>
                      <p class="text-nowrap"><b>Country:</b>
                      <div id="country">${x.country}</div></p>
                      <p><b>from</b> 
                      <div id="date_from">${x.vistited_from}</div></p>
                      
                      <p><b>to</b>
                      <div id="date_to">${x.visited_to}</div></p>
                      <div id="weather-${x.city}"></div>
                      <p><b>Whats up here:</b><p>
                      <p id="description">${x.description}</p>
                      <p>
                         <button id=delete_${x.id} class="btn btn-primary delete_btn">delete</button>
                         <button id=edit_${x.id} class="btn btn-primary edit_btn">edit</button>
                      </p>`
      grid.appendChild(el);
      
  }
}

function addFormEvents(){
  
  if(initialLoad){

  var formbutton = document.getElementById("add_new_location")
  formbutton.addEventListener("click", ()=>{
  document.getElementById("input_form").style.display = "block";
  document.getElementById("save_trip_btn").style.display = "inline-block";
  document.getElementById("save_changes_btn").style.display = "none";})

  var saveButton = document.getElementById("save_trip_btn")
  saveButton.addEventListener("click", ()=>{handleEntrieData()});

  var cancelButton = document.getElementById("cancel_btn")
  cancelButton.addEventListener("click", function(){
  document.getElementById("input_form").style.display = "none";
  clearForm()
  })

  }

  initialLoad = false;

  var deletebuttons = document.getElementsByClassName("delete_btn");
  var deletebuttonsCount = deletebuttons.length;
  for (var i = 0; i <= deletebuttonsCount-1; i += 1) {
    deletebuttons[i].addEventListener("click", function(){
      console.log("This id on cancel Button:" + this.id)
      deleteData(this.id)
    })
  };
  
  var editbuttons = document.getElementsByClassName("edit_btn")
  var editbuttonsCount = editbuttons.length;
  for (var i = 0; i <= editbuttonsCount-1; i += 1) {
    editbuttons[i].addEventListener("click", function(){
      editData(this.id)
    })
  };

};

function editData(id){
  let idNumber = id.split("_");
  let actual_id = idNumber[1];
  document.getElementById("save_trip_btn").style.display = "none";
  document.getElementById("save_changes_btn").style.display = "inline-block";
  let editData = document.getElementById(idNumber[1]).childNodes;
  // 1 = city , 5 = country , 9 = from , 13 = to , 20 = description 
  document.getElementById("input_form").style.display = "block";
  document.getElementById("city_name").value = editData[1].innerHTML;
  document.getElementById("country_name").value = editData[5].innerHTML;
  document.getElementById("arrival_date").value = editData[9].innerHTML;
  document.getElementById("departure_date").value = editData[13].innerHTML;
  document.getElementById("description").value = editData[20].innerHTML;
  window.scrollTo(0,0);
  let save_changes_btn = document.getElementById("save_changes_btn");
  save_changes_btn.addEventListener('click', ()=> {saveChangesOnData(actual_id)})
}

function saveChangesOnData(id){
  let changed_data=[];
    for (x of form_ids){
      changed_data.push(document.getElementById(x).value)
    }
  saveToJson(changed_data, "PUT", id)
  document.getElementById("input_form").style.display = "none";
  window.location.reload()
}

document.addEventListener("load", getDataFromApi());

