function increment() {
    var v = document.getElementById("x").value;
    document.getElementById("x").value = Number(v) - 1; 
}
setInterval(increment, 1000);

