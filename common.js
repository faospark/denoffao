function openInfo(tabName) {
    var i;
    var x = document.getElementsByClassName("tabs");
    for (i = 0; i < x.length; i++) {
        x[i].style.display = "none";
    }
    document.getElementById(tabName).style.display = "block";
}
function openNav() {
    document.getElementById("mySidenav").classList.toggle("openside");
    //document.getElementById("main").classList.toggle("opensidebody");
}

function closeNav() {
    document.getElementById("mySidenav").classList.toggle("openside");
    // document.getElementById("main").classList.add("closesidebody").classList.remove("opensidebody");
}