import { useEffect, useState } from "react";


function App() {

  //states for departure from nivelle and charleroi-sud
  const [nivelles, setNivelles] = useState()
  const [charleroi, setCharleroi] = useState()

  //get date for api URI
  const [date, setDate] = useState(new Date())

  // format date for URI
  let dd = date.getDate().toString();
  dd < 10 ? dd = "0" + dd : dd = dd

  let mm = (date.getMonth()+1).toString();
  mm < 10 ? mm = "0" + mm : mm = mm

  let yy = date.getFullYear().toString().slice(2);

  let dateURL = dd+mm+yy

  //format hour for URI
  let hh = date.getHours().toString();
  let min = date.getMinutes().toString();
  hh < 10 ? hh = "0" + hh : hh = hh
  min < 10 ? min = "0" + min : min = min
  let hour = hh + min

  //getTime to get the average of delay, ...
  let dateTime = date.getTime()


  // change date with interval
  useEffect(() => {
    const dateInterval = setInterval(() => {
        setDate(new Date())
    }, 300000);

    return () => {
        clearInterval(dateInterval)
    }}, [])

  //getAPIs & average train current hour
  const [averageNivelle, setAverageNivelle] = useState(0)
  const [delayNivelle, setDelayNivelle] = useState(0)
  const [averageCharleroi, setAverageCharleroi] = useState(0)
  const [delayCharleroi, setDelayCharleroi] = useState(0)
  const [pastNivelles, setPastNivelles] = useState()
  const [pastCharleroi, setPastCharleroi] = useState()
  let canceledCharleroi = 0
  let canceledNivelles = 0

  useEffect(() => {
    fetch('https://api.irail.be/connections/?from=charleroi-sud&to=nivelles&format=json&date=' + dateURL + '&time=' + hour)
    .then(response => response.json())
    .then(data => {
        setCharleroi(data)
    })
    fetch('https://api.irail.be/connections/?from=nivelles&to=charleroi-sud&format=json&date=' + dateURL + '&time=' + hour)
    .then(response => response.json())
    .then(data => {
        setNivelles(data)
    })

    //api 2 hours before
    if (hour < 200) {
      hour += 2200 
    }
    fetch('https://api.irail.be/connections/?from=charleroi-sud&to=nivelles&format=json&date=' + dateURL + '&time=' + (hour - 200))
    .then(response => response.json())
    .then(data => {
        setPastCharleroi(data)
    })
    fetch('https://api.irail.be/connections/?from=nivelles&to=charleroi-sud&format=json&date=' + dateURL + '&time=' + (hour-200))
    .then(response => response.json())
    .then(data => {
        setPastNivelles(data)
    })

    // average nivelles
    let trainsNivelles = nivelles.connection.length
    let ridingTrainNivelle = 0;
    nivelles.connection.forEach(e => {
      if (dateTime + 3600000 >= e.departure.time * 1000) {
        ridingTrainNivelle += 1
      }
    });
    setAverageNivelle((ridingTrainNivelle/trainsNivelles * 100).toFixed(2))
    
    //average charleroi
    let trainsCharleroi = charleroi.connection.length
    let ridingTrainCharleroi = 0;
    charleroi.connection.forEach(e => {
      if (dateTime + 3600000 >= e.departure.time * 1000) {
        ridingTrainCharleroi += 1
      }
    });
    setAverageCharleroi((ridingTrainNivelle/trainsCharleroi * 100).toFixed(2))
    
    //delay nivelles
    let delayTrainNivelle = 0
    nivelles.connection.forEach(e => {
      if (dateTime + 3600000 >= e.departure.time * 1000 && (e.departure.delay > 0)) {
        delayTrainNivelle += parseInt(e.departure.delay)
      }
    });
    let delayRawNivelles = delayTrainNivelle/trainsNivelles

    //delay charleroi
    let delayTrainCharleroi = 0
    charleroi.connection.forEach(e => {
      if (dateTime + 3600000 >= e.departure.time * 1000 && (e.departure.delay > 0)) {
        delayTrainCharleroi += parseInt(e.departure.delay)
      }
    });
    let delayRawCharleroi = delayTrainCharleroi/trainsCharleroi

    //function format delay
    const formatDelay = (delay) => {
      let hourDelay = new Date(delay * 1000)
      return hourDelay.getMinutes()
    }
    setDelayNivelle(formatDelay(delayRawNivelles))
    setDelayCharleroi(formatDelay(delayRawCharleroi))
    

    //canceled train 2 last hours
    canceledCharleroi = 0
    canceledNivelles = 0
    pastCharleroi.connection.forEach(e => {
      if (e.departure.canceled != "0") {
        canceledCharleroi += 1
      }
    });
    pastNivelles.connection.forEach(e => {
      if (e.departure.canceled != "0") {
        canceledNivelles += 1
      }
    });


    
  }, [date])

  return (
    <div className="App">
      <p>Pourcentage de train en marche durant la prochaine heure : {averageNivelle} % & {averageCharleroi} %</p>
      <p>Retards nivelle : {delayNivelle}min</p>
      <p>Retards Charleroi : {delayCharleroi}min</p>
      <p>Trains annulés Nivelles: {canceledNivelles}</p>
      <p>Trains annulés Charleroi : {canceledCharleroi}</p>
      <h1>{dd + "/"+ mm + "/"+ yy} = {dateTime} heure = {hour}</h1>
    </div>
  );
}

export default App;
