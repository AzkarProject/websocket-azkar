fakeRobubox = false;

function getFakeDataMap() {
	var dataMap = {
        Height: 1171,
        Width:2384,
        Resolution: 0.2,
        Offset : {     
        	X: -25.864425741383123,
  			Y: -6.450160926629708
        }
    }
    return dataMap;
}

function getFakeRobotInfo() {
    var robotInfo = {
        Pose : { 
            Orientation : {
                X:0,
                Y:0,
                Z:0.4147678497279166
            },
            Position : {
                X:8140780941908364,
                Y:-3.43144283510266,
                Z:0
            },
        },
        Status: 8,
        Timestamp : 1563315020
    }
    return robotInfo;
}

function getFakeBattery() {
    var battery ={
		"Properties":{
			"Critical":10,
			"Power":20,
			"Voltage":24
		},
		"Remaining":66,
		"Status":2,
		"Timestamp":14636000
	}
	return battery;
}