var canvasMap = document.getElementById("mapviewer_canvas");
var context = canvasMap.getContext("2d");
var img = new Image(); // Crée un nouvel objet Image
img.src = '/images/map.png'; // Définit le chemin vers sa source
var stringRobotX, stringRobotY, stringRobotZ, robotX, robotY, robotZ; // les coordonées de localisation du robot


//function init() {
var offsetX, offsetY, corrOffestX, corrOffestY, corrWidth, corrHeight;

$.get("http://192.168.173.1:8080/?url=http://127.0.0.1:50000/nav/maps/parameters", function(dataMap) {
    // console.log('lalala', dataMap);
    if (!dataMap)
        return "pas de données ! :/ ";

    /***********************Traitement des informations*****************************/
    offsetX = dataMap.Offset.X;
    offsetY = dataMap.Offset.Y;
    corrHeight = dataMap.Height;
    corrWidth = dataMap.Width;
    /**********************Utilisation des informations traitées*****************************************/
    context.drawImage(img, 0, 0, corrWidth / 4, corrHeight / 4);

    //   if (document.getElementById("dim")) {
    //     var text = " dimensions reelles de la carte :height : " + dataMap.Height + "px  et  width : " + dataMap.Width + "px";
    //    document.getElementById("dim").innerHTML = text;
    //    console.log('lalala 3 ');
//}
// context.drawImage(img, 0, 0, corrWidth, corrHeight);

/****************essai de trouver le 0,0 de la carte ************************/
context.beginPath();
context.arc(-(offsetX / 4), -(offsetY / 4), 2, 0, 2 * Math.PI, false); 
context.fillStyle = 'green'; context.fill(); context.lineWidth = 3; 
context.strokeStyle = '#003300'; context.stroke();

});
refresh( /*offsetX, offsetY*/ );
//   }

/* /** refresh 
 * every 600 ms 
 * 1) refresh the status  :   - recuperer le status du robot --> requete get sur url ???
 *                            - mettre à jour son status --> checkRobotStatus() ;
 *                            
 * 2)clean the canvas
 * 3)recheck the robot position  : recuperer la position du robot --> requete get sur url ?? 
 * 4)dessiner la position du robot sur le canvas --> drawRobot(x,y) 
 * 5) redraw locations point
 * */
function refresh() {
    var robotInfo, dataString, stringRobotX, stringRobotY, stringRobotZ, x, y, z;
    setInterval(function() {
        $.get("http://192.168.173.1:8080/?url=http://127.0.0.1:50000/robulab/localization/localization", function(dataLocalization) {
            if (!dataLocalization) {
                console.log('pas pu atteindre le service !! ');
                return;
            }

            dataString = new XMLSerializer().serializeToString(dataLocalization.documentElement);

            stringRobotX = dataString.substr(dataString.indexOf("<X>"), dataString.indexOf("</X>"));
            stringRobotY = dataString.substr(dataString.indexOf("<Y>"), dataString.indexOf("</Y>"));
            stringRobotZ = dataString.substr(dataString.indexOf("<Z>"), dataString.indexOf("</Z>"));

            //console.log('stringRobotX --> ', stringRobotX);
            //console.log('stringRobotY --> ', stringRobotY);
            //console.log('stringRobotZ --> ', stringRobotZ);

            robotX = stringRobotX.match(/\d+/)[0];
            robotY = stringRobotY.match(/\d+/)[0];
            robotZ = stringRobotZ.match(/\d+/)[0];
            // console.log('----------------------------------------------------');
            // console.log('robotX --> ', robotX);
            // console.log('robotY --> ', robotY);
            // console.log('robotZ --> ', robotZ);
            // console.log('----------------------------------------------------');
            //   x = (robotX - offsetX) / 4;
            //   y = (robotY - offsetY) / 4;
            //   z = robotZ;

            /* console.log('----------------------------------------------------');
             console.log('offsetX --> ', offsetX);
             console.log('offsetY --> ', offsetY);
             console.log('----------------------------------------------------'); */

            /*  console.log('----------------------------------------------------');
              console.log('x --> ', x);
              console.log('y --> ', y);
              console.log('z --> ', z);
              console.log('----------------------------------------------------');*/
            context.save();
            drawRobot(robotX, robotY, robotZ);
            context.restore();

        });
    }, 600);
}



//check robot status
// null => offline
//0 waiting gotopoint or gotopose request
//1 waiting move request 
//2 moving
function checkRobotStatus() {
    /*
    var bool = robotStatus || 0;
    if(bool){
        if(robotStatus.Status >=0 ){
            if(co==0){
                $('.statusCo').empty();
                $('.statusCo').css("color", "#00FF00")
                $('.statusCo').append("Online"); 
                $('.status').empty();
            }
            co=1;                              
        }
        else{                  
            $("#status").hide();
            $('.status').empty();
            $('.statusCo').empty();
            $('.statusCo').append("Offline"); 
            $('.statusCo').css("color", "#FF0000");
            co =0;                
        }
    }          
    else {
        $('.status').empty();
        $('.statusCo').empty();
        $('.statusCo').append("Offline"); 
        $('.statusCo').css("color", "#FF0000");
        co =0;
    }   
    */
}


//calculate x , y and theta 
// then draw it 
function drawRobot(x, y, z) {
    circleWithDirection(x, y, z, "blue", 6, 4);
    /*
    var rx = robotInfo.Pose.Position.Y * mapInfo.Resolution +corrOffestY ;
    var ry = robotInfo.Pose.Position.X * mapInfo.Resolution + corrOffestX;
    var qw = robotInfo.Pose.Orientation.W;
    var qz = robotInfo.Pose.Orientation.Z;
    var heading =0;
    var attitude = 0 ;
    var qx = 0;
    var qy = 0;
    var qy2 = qy*qy;
    var qz2 = qz*qz;
    var test= qx*qy + qz*qw;
    if (test > 0.499) {
        heading = 360/Math.PI*Math.atan2(qx,qw);
        attitude = 90;
        return;
    }
    if (test < -0.499) {
        heading = -360/Math.PI*Math.atan2(qx,qw);
        attitude = -90;
        return;
    }
    heading= Math.atan2(2*qy*qw-2*qx*qz,1-2*qy2-2*qz2);
    attitude= Math.asin(2*qx*qy+2*qz*qw);
    var angle = (heading==0)? angle= -attitude:Math.PI+attitude;
    //draw it 
    circleWithDirection(mapInfo.Width - rx- 2- cropX/2, mapInfo.Height - ry - 2 - cropY/2,  angle- Math.PI/2,"blue",6,4);
    */
}

//draw a circle with a line     
function circleWithDirection(x, y, theta, color, size, sizeStroke) {

    context.beginPath();
    context.arc(x, y, size, 0, 2 * Math.PI, false);
    context.fillStyle = color;
    context.fill();
    context.lineWidth = 2;
    context.strokeStyle = "black";
    context.stroke();
    x2 = Math.cos(theta) * 2;
    y2 = Math.sin(theta) * 2;
    context.closePath();
    context.beginPath();
    context.moveTo(x, y);
    context.lineTo(x2, y2);
    context.strokeStyle = color;
    context.lineCap = "round";
    context.lineWidth = sizeStroke;
    context.stroke();
    context.closePath();

}


//draw a triangle on canvas at the x y  coordinates 
//theta is the angle
function triangle(x, y, theta) {
    /*
    context.stroke();
    context.beginPath();
    context.lineWidth =1;
    context.strokeStyle = "black";
    context.fillStyle = "#00D2FF";
    var size = 15;
    x2 =x + Math.cos(theta) * size;
    y2 = y+ Math.sin(theta)*size;
    context.moveTo(x2, y2);       
    x2 = x + Math.cos(Math.PI*1.15 + theta) * size;
    y2 = y+ Math.sin(Math.PI*1.15 + theta)*size;
    context.lineTo(x2, y2);
    x2 = x + Math.cos(Math.PI + theta) * size/2;
    y2 = y+ Math.sin(Math.PI + theta)*size/2    ;
    context.lineTo(x2, y2);
    x2 = x + Math.cos(Math.PI*0.85  + theta) * size;
    y2 = y+ Math.sin(Math.PI*0.85 + theta)*size ;
    context.lineTo(x2, y2);
    context.closePath();
    context.fill();
    context.stroke();         */
}
