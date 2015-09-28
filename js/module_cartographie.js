var canvasMap = document.getElementById('myCanvas');
var context = canvasMap.getContext('2d');
var stringRobotX, stringRobotY, stringRobotZ, robotX, robotY, robotZ; // les coordonées de localisation du robot
// offsetX, offsetY, corrOffestX, corrOffestY, corrWidth, corrHeight , resolution 
offsetX = null;
offsetY = null;
corrOffestX = null;
corrOffestY = null;
corrWidth = null;
corrHeight = null;
resolution = null;
pointX = null;
pointY = null;

var urlP = 'http://127.0.0.1:8080/127.0.0.1:50000/nav/maps/parameters';

window.onload = function() {
    // Necessity to run this code only after the web page has been loaded.
    var imageObj = new Image();
    imageObj.src = '/images/mapResize.png';
    // Callback function called by the imageObj.src = .... line
    // located after this function
    imageObj.onload = function() {
        // Draw the image only when we have the guarantee 
        // that it has been loaded

        $.get(urlP, function(data) { // 1 -  et 2- 
            if (!data)
                return 'pas de données ! :/ ';

            offsetX = data.Offset.X;
            offsetY = data.Offset.Y;
            corrHeight = data.Height;
            corrWidth = data.Width;
             resolution = data.Resolution;

            corrOffestX = corrHeight + (offsetX /resolution);
            corrOffestY = corrWidth + (offsetY /resolution);


           
            //            context.translate(200, 400)
            context.scale(0.2, 0.2)
            context.rotate(-Math.PI / 2)
            context.drawImage(imageObj, 0, 0 /*, corrWidth, corrHeight*/ )


            // Utilisation des informations traitées*****************************************/
            pointX = corrOffestX ;
            console.log('pointX --> ', pointX);
            pointY = corrOffestY ;
            console.log('pointY --> ', pointY);
            // ****************essai de trouver le 0,0 de la carte ************************/
             context.beginPath()
             context.arc(pointX, pointY, 2, 0, 2 * Math.PI, false)
              context.fillStyle = 'green'
            context.fill()
              context.lineWidth = 3
            ////   context.strokeStyle = '#003300'
            //context.stroke()

            // refresh(offsetX, offsetY, resolution)
        })

    }

}

/* /** refresh 
 * every 600 ms 
 * 1) refresh the status  :   - recuperer le status du robot --> requete get sur url ???
 *                            - mettre à jour son status --> checkRobotStatus() 
 *                            
 * 2)clean the canvas
 * 3)recheck the robot position  : recuperer la position du robot --> requete get sur url ?? 
 * 4)dessiner la position du robot sur le canvas --> drawRobot(x,y) 
 * 5) redraw locations point
 * */

function refresh(offsetX, offsetY, resolution) {
    var robotInfo, dataString, stringRobotX, stringRobotY, stringRobotZ, stringOrientationZ
    var x = 0,
        y = 0,
        z = 0

    // 1 - Clear
    // context.clearRect(0, 0, canvasMap.width, canvasMap.height)
    // 2 - Draw

    setInterval(function() {
        // var urlRefresh = "http://192.168.173.1:8080/?url=http://127.0.0.1:50000/robulab/localization/localization"; via rubulabWifi
        var urlRefresh = 'http://127.0.0.1:8080/127.0.0.1:50000/robulab/localization/localization'
        $.get(urlRefresh, function(dataLocalization) {
            if (!dataLocalization) {
                console.log('pas pu atteindre le service !! ');
                return
            }

            dataString = new XMLSerializer().serializeToString(dataLocalization.documentElement);
            // console.log(dataString)

            stringRobotX = dataString.substr(dataString.indexOf('<X>'), dataString.indexOf('</X>'));
            // console.log("StringRobot X ---> ", stringRobotX)
            stringRobotY = dataString.substr(dataString.indexOf('<Y>'), dataString.indexOf('</Y>'));
            // console.log("StringRobot Y ---> ", stringRobotY)

            robotX = stringRobotX.match(/\d+/)[0];
            // console.log("robot X ---> ", robotX)
            robotY = stringRobotY.match(/\d+/)[0];
            // console.log("robot Y ---> ", robotY)

            // recupère les données comprises au niveau de la balise orientation
            stringOrientationZ = dataString.substr(dataString.indexOf('<Orientation'));
            // console.log('string orientation --> ', stringOrientationZ)

            stringRobotZ = stringOrientationZ.substr(stringOrientationZ.indexOf('<Z>'), stringOrientationZ.indexOf('</Z>')); // recupère le Z
            // console.log('string robot Z --> ', stringRobotZ)
            robotZ = stringRobotZ.match(/\d+/)[0];
            // console.log("robot Z ---> ", robotZ)

            context.translate(offsetX / 4, offsetY / 4);

            x = parseInt(robotX);
            console.log('X--> ', x);
            y = parseInt(robotY);
            console.log('Y--> ', y);
            z = parseInt(robotZ);
            drawRobot(x, y, z, 'blue', 8, 5);

        })
    }, 600);
}

// check robot status
// null => offline
// 0 waiting gotopoint or gotopose request
// 1 waiting move request 
// 2 moving

// calculate x , y and theta 
// then draw it 
function drawRobot(x, y, z, theta, color, size, sizeStroke) {
    // context.save()
    context.beginPath();
    context.arc(x, y, size, 0, 2 * Math.PI, false);
    context.fillStyle = color;
    context.fill();
    context.lineWidth = 2;
    context.strokeStyle = 'black';
    context.stroke();
    // x2 = Math.cos(theta) * 2
    //  y2 = Math.sin(theta) * 2
    context.closePath();
    context.beginPath();
    context.moveTo(x, y);
    context.lineTo(x + theta, y + theta);
    context.strokeStyle = color;
    context.lineCap = 'round';
    context.lineWidth = sizeStroke;
    context.stroke();
    context.closePath();
    // context.restore()

}

// draw a circle with a line     
function circleWithDirection(x, y, theta) {
    context.save();
    context.beginPath();
    context.arc(x, y, size, 0, 2 * Math.PI, false);
    context.fillStyle = color;
    context.fill();
    context.lineWidth = 2;
    context.strokeStyle = 'black';
    context.stroke();
    // x2 = Math.cos(theta) * 2
    //  y2 = Math.sin(theta) * 2
    context.closePath();
    context.beginPath();
    context.moveTo(x, y);
    context.lineTo(x + theta, y + theta);
    context.strokeStyle = color;
    context.lineCap = 'round';
    context.lineWidth = sizeStroke;
    context.stroke();
    context.closePath();
    context.restore();

}
