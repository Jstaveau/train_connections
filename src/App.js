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

  let mm = date.getMonth().toString();
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
    }, 10000);

    return () => {
        clearInterval(dateInterval)
    }}, [])

  //getAPIs & average train current hour
  const [averageNivelle, setAverageNivelle] = useState(0)
  useEffect(() => {
    fetch('https://api.irail.be/connections/?from=charleroi-sud&to=nivelles&format=json&date=' + dateURL + '&time=' + hour)
    .then(response => response.json())
    .then(data => {
        setNivelles(data)
    })
    fetch('https://api.irail.be/connections/?from=nivelles&to=charleroi-sud&format=json&date=' + dateURL + '&time=' + hour)
    .then(response => response.json())
    .then(data => {
        setCharleroi(data)
    })
    // average
    console.log(nivelles.connection.length);
    let trainsNivelles = nivelles.connection.length
    let ridingTrainNivelle = 0;
    nivelles.connection.forEach(e => {
      if (dateTime + 3600000 >= e.departure.time * 1000) {
        ridingTrainNivelle += 1
        console.log(new Date(e.departure.time * 1000).getTime());
        console.log(dateTime);
      }
    });
    setAverageNivelle(ridingTrainNivelle/trainsNivelles * 100)
    
    
  }, [date])

  
  
  



  return (
    <div className="App">
      <p>Pourcentage de train en marche durant la prochaine heure : {averageNivelle} %</p>
      <h1>{dd + "/"+ mm + "/"+ yy} = {dateTime} heure = {hour}</h1>
            {nivelles &&
                nivelles.connection.map(item =>{
                    return <p>{item.departure.station}</p>
                })}
            <h1>{dd + "/"+ mm + "/"+ yy} = {dateTime} </h1>
            {charleroi &&
                charleroi.connection.map(item =>{
                    return <p>{item.departure.station}</p>
                })}
    </div>
  );
}

export default App;
