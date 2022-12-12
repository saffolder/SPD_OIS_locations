const fs = require('fs');

fs.readFile('assets/OISData.json', 'utf8', (error, oisData) => {
  if(error){
    console.log(error);
    return;
  }
  let features = [];
  let data = JSON.parse(oisData);
  for (let i = 0; i < data.length; i++) {
    let feature = {
      "type": "Feature",
      "properties": {
        "City": data[i]["City"],
        "State": data[i]["State"],
        "Rank": data[i]["Rank"],
        "Officer Gender": data[i]["Officer Gender"],
        "Officer Race": data[i]["Officer Race"],
        "Years of SPD Service": data[i]["Years of SPD Service"],
        "Officer Injured": data[i]["Officer Injured"],
        "Number of Rounds": data[i]["Number of Rounds"],
        "Subject Gender": data[i]["Subject Gender"],
        "Subject Race": data[i]["Subject Race"],
        "Subject DOB": data[i]["Subject DOB"],
        "Subject Age": data[i]["Subject Age"],
        "Subject Weapon": data[i]["Subject Weapon"],
        "Type of Weapon": data[i]["Type of Weapon"],
        "Fatal": data[i]["Fatal"],
        "On-duty": data[i]["On-duty"],
        "Disposition": data[i]["Disposition"],
        "Officer Disciplined?": data[i]["Officer Disciplined?"],
        "Summary": data[i]["Summary"]

      },
      "geometry": {
        "type": "Point",
        "coordinates": [data[i].Longitude, data[i].Latitude]
      }
    }
    features.push(feature);
  }
  let newFormat = {
    "type": "FeatureCollection",
    "features": features
  }
  let newFormString = JSON.stringify(newFormat);
  fs.writeFile('assets/OISCleaned.geojson', newFormString, err => {
    if (err) {
      console.log('Error writing file', err);
    } else {
      console.log('Successfully wrote file');
    }
  });
});
