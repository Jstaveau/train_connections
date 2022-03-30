import { useEffect, useState } from "react";
import '../node_modules/bootstrap/dist/css/bootstrap.min.css'


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
    }, 1000);

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
  const [delayRawNivelles, setDelayRawNivelles] = useState()
  const [delayRawCharleroi, setDelayRawCharleroi] = useState()

  let canceledCharleroi = 0
  let canceledNivelles = 0

  //functions
  //average
  const average = (ville) => {
    let trainsNivelles = ville.connection.length
    let ridingTrainNivelle = 0;
    ville.connection.forEach(e => {
      if (dateTime + 3600000 >= e.departure.time * 1000) {
        ridingTrainNivelle += 1
      }
    });
    let result = (ridingTrainNivelle/trainsNivelles * 100).toFixed(2)
    return result
  }
  //delay
  const delay = (ville) => {
    let trainsNivelles = ville.connection.length
    let delayTrainNivelle = 0
    ville.connection.forEach(e => {
      if (dateTime + 3600000 >= e.departure.time * 1000 && (e.departure.delay > 0)) {
        delayTrainNivelle += parseInt(e.departure.delay)
        }
    });
    let delayRawNivelles = delayTrainNivelle/trainsNivelles
    return parseInt(delayRawNivelles)
  }
  //format delay
  const formatDelay = (delay) => {
    let hourDelay = new Date(delay * 1000)
    return hourDelay.getMinutes()
  }

  //useEffect to update data
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
    setAverageNivelle(average(nivelles))
    
    //average charleroi
    setAverageCharleroi(average(charleroi))
    
    //delay nivelles

    // let delayTrainNivelle = 0
    // nivelles.connection.forEach(e => {
    //   if (dateTime + 3600000 >= e.departure.time * 1000 && (e.departure.delay > 0)) {
    //     delayTrainNivelle += parseInt(e.departure.delay)
    //   }
    // });
    // let delayRawNivelles = delayTrainNivelle/trainsNivelles
    setDelayRawNivelles(delay(nivelles))


    //delay charleroi
    // let delayTrainCharleroi = 0
    // charleroi.connection.forEach(e => {
    //   if (dateTime + 3600000 >= e.departure.time * 1000 && (e.departure.delay > 0)) {
    //     delayTrainCharleroi += parseInt(e.departure.delay)
    //   }
    // });
    // let delayRawCharleroi = delayTrainCharleroi/trainsCharleroi
    setDelayRawCharleroi(delay(charleroi))


    //function format delay
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
    <div className="App container mt-5 bg-dark p-3 rounded rounded-3">
      <div className="d-flex justify-content-around mt-5 m-auto">
        <div>
          <h5 className="text-white">Pourcentage des trains en marche partants de Nivelles</h5>
          <div className="progress mb-3">
            <div className="progress-bar bg-danger" role="progressbar"  aria-valuenow="25" style={{width : averageNivelle + '%'}} aria-valuemin="0" aria-valuemax="100">{averageNivelle}%</div>
          </div>
        </div>
        <div>
          <h5 className="text-white">Pourcentage des trains en marche partants de Charleroi</h5>
          <div className="progress">
            <div className="progress-bar bg-danger" role="progressbar"  aria-valuenow="25" style={{width : averageCharleroi + '%'}} aria-valuemin="0" aria-valuemax="100">{averageCharleroi}%</div>
          </div>
        </div>
      </div>
      <div className="text-light mt-5 d-flex justify-content-around">
        <div>
          <p>Retard moyen pour le trains partants de Nivelles</p>
          <p className="text-center bg-light text-danger p-3">{delayNivelle} minute(s)</p>
        </div>
        <div>
          <p>Retard moyen pour le trains partants de Charleroi</p>
          <p className="text-center bg-light text-danger p-3">{delayCharleroi} minute(s)</p>
        </div>
      </div>
      <div className="text-light mt-5 mb-5 d-flex justify-content-around">
        <div>
          <p>Trains annulés durant les deux dernières heures à Nivelles</p>
          <p className="text-center bg-light text-danger p-3">{canceledNivelles} train(s)</p>
        </div>
        <div>
          <p>Trains annulés durant les deux dernières heures à Nivelles</p>
          <p className="text-center bg-light text-danger p-3">{canceledCharleroi} train(s)</p>
        </div>
      </div>
    </div>
  );
}

export default App;
