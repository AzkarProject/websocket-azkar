/*
*
* Authors: Thierry Bergeron, Michel Buffa
* Copyright : © CNRS (Laboratoire I3S) / université de Nice
*
*/

(function(exports){

dyDns = 'azkar.ddns.net'; // Adresse no-Ip pointant sur Livebox domicile


// Todo: a modifier coté dydns >>>> Redirection vers https...
if (hostName == "azkar-Latitude-E4200") indexUrl = "http://" + dyDns; // Si machine derrière liveBox && noip

// Machines windows - I3S
if (hostName == "azcary") ipaddress = "192.168.173.1"; // Ip du réseau virtuel robulab2_wifi
else if (hostName == "thaby") ipaddress = "192.168.173.1"; // Tablette HP sur Robulab: ip du réseau virtuel robulab_wifi

// Machine Windows - Domicile
else if (hostName == "lapto_Asus") ipaddress = "0.0.0.0"; // Pc perso - (IP interne, Livebox domicile)

// Machines Ubuntu - Domicile
else if (hostName == "ubuntu64azkar") ipaddress = "192.168.1.10"; // Vm Ubuntu sur Pc perso (Domicile)
else if (hostName == "azkar-Latitude-E4200") ipaddress = "0.0.0.0"; // Pc Dell Latitude - Livebox domicile - noip > azkar.ddns.net

// VM Sparks -Ubuntu
else if (hostName == "Mainline") ipaddress = "134.59.130.141"; // IP statique de la Vm sparks
else if (hostName == "AZKAR-1") ipaddress = "134.59.130.143"; // IP statique de la Vm sparks 
else if (hostName == "AZKAR-2") ipaddress = "134.59.130.142"; // IP statique de la Vm sparks

// Seul le port 80 passe malgrès les règles appropriées dans le NAT et le Firewall de la livebox ...
// if (hostName == "azkar-Latitude-E4200") port = 80;
// TODO > Trouver bon réglage livebox pour faire cohabiter port 2000(nodejs) et 80(apache) en même temps.




})(typeof exports === 'undefined'? this['appCNRS']={}: exports);
