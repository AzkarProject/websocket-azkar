function getCarto ()
{

console.log("avant  le socket emit affiche carto ")
  socket.emit("afficheCarto",{
                    message: 'je veux la cartographie du batiment stp '                   
                });
  console.log("après le socket emit affiche carto ")

}
