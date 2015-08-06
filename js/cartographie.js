//this script is used in index.jsp and admin.jsp
$(document).ready(function() {
            var tab = [];
            var canvasMap = document.getElementById("canvasMap");
            var context = canvasMap.getContext("2d");
            var co = 0;
            //used with admin.jsp
            cropY = 0;
            cropX = 0;

            /* START */
            /* call init() then load() and finaly refresh() with setInterval */
            init( /*load*/ );

            function getDataMap() {
                 url = "http://192.168.173.1:8080/?url=http://127.0.0.1:50000/nav/maps/parameters" ;
                $.get(url, function(dataMap) {
                    jsonMapInfo = dataMap;
                    mapInfo = JSON.parse(jsonMapInfo);
                    //get the map width and height to adjust the canvas
                    $('#canvasMap').attr("width", mapInfo.Width);
                    $('#canvasMap').attr("height", mapInfo.Height);
                    console.log("Dimension " + mapInfo.Width + " " + mapInfo.Height);

                    if (document.getElementById("dim")) {
                        //text info
                        var text = "height : " + mapInfo.Height + "px  width : " + mapInfo.Width + "px";
                        document.getElementById("dim").innerHTML = text;
                    }

                });

            }



            function init(callback) {

                /*  $.getJSON("ajax/test.json", function(data) {
                        var items = [];
                        $.each(data, function(key, val) {
                            items.push("<li id='" + key + "'>" + val + "</li>");
                        });
*/

                $.get("http://192.168.173.1:8080/?url=http://127.0.0.1:50000/nav/maps/parameters", function(dataMap) {
                    jsonMapInfo = dataMap;
                    mapInfo = JSON.parse(jsonMapInfo);
                    //get the map width and height to adjust the canvas
                    $('#canvasMap').attr("width", mapInfo.Width);
                    $('#canvasMap').attr("height", mapInfo.Height);
                    console.log("Dimension " + mapInfo.Width + " " + mapInfo.Height);

                    if (document.getElementById("dim")) {
                        //text info
                        var text = "height : " + mapInfo.Height + "px  width : " + mapInfo.Width + "px";
                        document.getElementById("dim").innerHTML = text;
                    }
                    //if you are on index.jsp
                    //
                    /* else {
                         //load the crops preference (read the variable.json file)
                         $.get('variable.json', function(prefs) {
                             mapPrefs = prefs;
                             setTimeout(function() {
                                 //mapTop and mapRight <=> change width height canvas 
                                 //mapBot and mapleft <=> change background position
                                 mapTop = parseInt(mapPrefs.map.top);
                                 mapRight = parseInt(mapPrefs.map.right);
                                 mapBot = parseInt(mapPrefs.map.bot);
                                 mapLeft = parseInt(mapPrefs.map.left);
                                 $('#canvasMap').attr("height", mapInfo.Height - mapTop);
                                 $('#canvasMap').attr("width", mapInfo.Width - mapRight);
                                 var bgX = (mapLeft * -1) + "px";
                                 $('#canvasMap').css('background-position-x', bgX);
                                 cropX = mapLeft * 2;
                                 var bgY = (mapBot * -1) + "px";
                                 $('#canvasMap').css('background-position-y', bgY);
                                 cropY = mapBot * 2;
                             }, 10);
                         });
                     }*/
                });

                /*get map location and robot positions json*/
                /*    $.get(ipServlet + 'mapServlet?locations=1', function(dataLocations) {
                        jsonLocation = eval(dataLocations);
                        //get robot position
                        $.get(ipServlet + 'mapServlet?localization=1', function(dataLocalization) {
                            robotInfo = JSON.parse(dataLocalization);
                            //then, call load function
                            if (callback) {
                                callback();
                            }
                        });
                    });*/
            }

            /*

             function load(){
                    mapInfo = JSON.parse(jsonMapInfo);
                    var offsetX  = mapInfo.Offset.X;
                    var offsetY  = mapInfo.Offset.Y;         
                    corrOffestX = mapInfo.Height -(mapInfo.Resolution *offsetX );
                    corrOffestY=  mapInfo.Width -(mapInfo.Resolution *offsetY );
                    //calcul the coordinates of locationsPoint on the canvasMap
                    //and fill tab array
                    initLocationsPoints();           
                    //add click event on canvas MAp 
                    canvasMap.addEventListener('mousedown', function(evt){
                        var mousePos = getMousePos(canvasMap, evt);
                        //var message = "Mouse position: " + mousePos.x + "," + mousePos.y;
                        var j =0;
                        for(j=0; j<tab.length;j+=1){
                            //crop
                            if(Math.abs(tab[j].x - mousePos.x )<20){
                                if(Math.abs(tab[j].y - mousePos.y )<10){                                      
                                    gotoPoint(j);
                                    break;
                                }
                            }
                        }
                    }, false);
                    //then call refresh function 
                    refresh();                
                }
                



            */








        }
