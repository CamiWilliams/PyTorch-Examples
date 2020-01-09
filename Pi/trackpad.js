var canvas,ctx;
var mouseX,mouseY,mouseDown=0;
var touchX,touchY;
var penSize = 20;

var pixels = [];

function drawDot(ctx,x,y,size) {
    r=0; g=0; b=0; a=255;
    ctx.fillStyle = "rgba("+r+","+g+","+b+","+(a/255)+")";

    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI*2, true);
    ctx.closePath();
    ctx.fill();
} 

function clearCanvas(canvas,ctx) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    pixels = []
}

function sketchpad_mouseDown() {
    mouseDown=1;
    drawDot(ctx,mouseX,mouseY,penSize);
}

function sketchpad_mouseUp() {
    mouseDown=0;
}

function sketchpad_mouseMove(e) { 
    getMousePos(e);

    if (mouseDown==1) {
        drawDot(ctx,mouseX,mouseY,penSize);
    }
}

function getMousePos(e) {
    if (!e)
        var e = event;

    if (e.offsetX) {
        mouseX = e.offsetX;
        mouseY = e.offsetY;
    } else if (e.layerX) {
        mouseX = e.layerX;
        mouseY = e.layerY;
    }
    
    x = Math.floor(e.offsetY * 0.05);
    y = Math.floor(e.offsetX * 0.05) + 1;
    for (var dy = 0; dy < 2; dy++){
        for (var dx = 0; dx < 2; dx++){
            if ((x + dx < 28) && (y + dy < 28)){
                pixels[(y+dy)+(x+dx)*28] = 1;
            }
        }
    }
}

function sketchpad_touchStart() {
    getTouchPos();
    drawDot(ctx,touchX,touchY,penSize);

    event.preventDefault();
}

function sketchpad_touchMove(e) { 
    getTouchPos(e);
    drawDot(ctx,touchX,touchY,penSize); 

    event.preventDefault();
}

function getTouchPos(e) {
    if (!e)
        var e = event;

    if(e.touches) {
        // Only deal with one finger
        if (e.touches.length == 1) {
            // Get the information from one finger
            var touch = e.touches[0];
            touchX=touch.pageX-touch.target.offsetLeft;
            touchY=touch.pageY-touch.target.offsetTop;
        }
    }
}

function init() {
    canvas = document.getElementById('sketchpad');

    if (canvas.getContext)
        ctx = canvas.getContext('2d');

    if (ctx) {
        canvas.addEventListener('mousedown', sketchpad_mouseDown, false);
        canvas.addEventListener('mousemove', sketchpad_mouseMove, false);
        window.addEventListener('mouseup', sketchpad_mouseUp, false);

        canvas.addEventListener('touchstart', sketchpad_touchStart, false);
        canvas.addEventListener('touchmove', sketchpad_touchMove, false);

        window.addEventListener('keyup',function(e){
            if (e.keyCode === 13) {
                showNumbers();
            } else if (e.keyCode === 67) {
                clearCanvas(canvas,ctx);
            } else if (e.keyCode === 68) {
                alert('d');
            } else {

            }
        });
    }

    piSpace = document.getElementById('pis');
    for (var i = 0; i < PI.length; ++i) {
        var idName = "pinum_" + i;
        piSpace.innerHTML += "<div class=\"pi_num hide\" id=\"" + idName + "\">" + PI[i] + "</div>";
        if (i == 0) {
            piSpace.innerHTML += "<div class=\"pi_num hide\" id=\"pidot\">\.</div>";
        }
    }

    var colorNumbers = document.querySelectorAll('.pi_num');
    //var k = 0;

    for (var j = 0; j < colorNumbers.length; ++j) {
        colorNumbers[j].style.color = GRAD_COLS[Math.floor(Math.random()*GRAD_COLS.length)];
        /*k++;
        if (k == GRAD_COLS.length) {
            k = 0;
        }*/
    }
}

async function showNumbers() {
    var num = await sendImageToModel(canvas);
    document.getElementById("pidot").className = "pi_num show";

    for (var i = 0; i < PI.length; ++i) {
        var idName = "pinum_" + i;
        if (num == PI[i] && !PI_DRAWN[i]) {
            document.getElementById(idName).className = "pi_num show";
            PI_DRAWN[i] = true;
            break;
        }
    }
    clearCanvas(canvas,ctx);
}

function set_value() {
    var result = "[[["
    for (var i = 0; i < 28; i++) {
        result += "["
        for (var j = 0; j < 28; j++) {
            result += pixels [i * 28 + j] || 0
            if (j < 27) {
                result += ", "
            }
        }
        result += "]"
        if (i < 27) {
            result += ", "
        }
    }
    result += "]]]"
    console.log(result)
    return result
}

async function sendImageToModel(canvas) {
    var data = set_value();
    var payload = {
        "data" : data
    }
    var response = await fetch('https://53acxaub1b.execute-api.us-east-1.amazonaws.com/prod', {
        method: 'POST',
        body: JSON.stringify(payload), // string or object
        dataType: 'json',
        headers: {
          'Content-Type': 'application/json'
        }
    });
    var myJson = await response.json();
    console.log(myJson);
    return myJson;
}

var GRAD_COLS = [
    "#ffffff", "#fdecdd", "#fad9bc", "#f7c79a", "#f5b478", "#f3a157", "#f08e35",
    "#eb813f", "#e77549", "#e26852", "#dd5c5c", "#d94f66", "#d44370", "#c2417d",
    "#b03e8b", "#9e3b98", "#8c39a5", "#7a37b3", "#6834c0", "#8156ca", "#9a78d5",
    "#b49ae0", "#d9ccef"];

// 1000 digits
var PI = [
    "3", "1", "4", "1", "5", "9", "2", "6", "5", "3", "5", "8", "9", "7", "9", "3", "2", "3",
    "8", "4", "6", "2", "6", "4", "3", "3", "8", "3", "2", "7", "9", "5", "0", "2", "8",
    "8", "4", "1", "9", "7", "1", "6", "9", "3", "9", "9", "3", "7", "5", "1", "0", "5",
    "8", "2", "0", "9", "7", "4", "9", "4", "4", "5", "9", "2", "3", "0", "7", "8", "1",
    "6", "4", "0", "6", "2", "8", "6", "2", "0", "8", "9", "9", "8", "6", "2", "8", "0",
    "3", "4", "8", "2", "5", "3", "4", "2", "1", "1", "7", "0", "6", "7", "9", "8", "2",
    "1", "4", "8", "0", "8", "6", "5", "1", "3", "2", "8", "2", "3", "0", "6", "6", "4",
    "7", "0", "9", "3", "8", "4", "4", "6", "0", "9", "5", "5", "0", "5", "8", "2", "2",
    "3", "1", "7", "2", "5", "3", "5", "9", "4", "0", "8", "1", "2", "8", "4", "8", "1",
    "1", "1", "7", "4", "5", "0", "2", "8", "4", "1", "0", "2", "7", "0", "1", "9", "3",
    "8", "5", "2", "1", "1", "0", "5", "5", "5", "9", "6", "4", "4", "6", "2", "2", "9",
    "4", "8", "9", "5", "4", "9", "3", "0", "3", "8", "1", "9", "6", "4", "4", "2", "8",
    "8", "1", "0", "9", "7", "5", "6", "6", "5", "9", "3", "3", "4", "4", "6", "1", "2",
    "8", "4", "7", "5", "6", "4", "8", "2", "3", "3", "7", "8", "6", "7", "8", "3", "1",
    "6", "5", "2", "7", "1", "2", "0", "1", "9", "0", "9", "1", "4", "5", "6", "4", "8",
    "5", "6", "6", "9", "2", "3", "4", "6", "0", "3", "4", "8", "6", "1", "0", "4", "5",
    "4", "3", "2", "6", "6", "4", "8", "2", "1", "3", "3", "9", "3", "6", "0", "7", "2",
    "6", "0", "2", "4", "9", "1", "4", "1", "2", "7", "3", "7", "2", "4", "5", "8", "7",
    "0", "0", "6", "6", "0", "6", "3", "1", "5", "5", "8", "8", "1", "7", "4", "8", "8",
    "1", "5", "2", "0", "9", "2", "0", "9", "6", "2", "8", "2", "9", "2", "5", "4", "0",
    "9", "1", "7", "1", "5", "3", "6", "4", "3", "6", "7", "8", "9", "2", "5", "9", "0",
    "3", "6", "0", "0", "1", "1", "3", "3", "0", "5", "3", "0", "5", "4", "8", "8", "2",
    "0", "4", "6", "6", "5", "2", "1", "3", "8", "4", "1", "4", "6", "9", "5", "1", "9",
    "4", "1", "5", "1", "1", "6", "0", "9", "4", "3", "3", "0", "5", "7", "2", "7", "0",
    "3", "6", "5", "7", "5", "9", "5", "9", "1", "9", "5", "3", "0", "9", "2", "1", "8",
    "6", "1", "1", "7", "3", "8", "1", "9", "3", "2", "6", "1", "1", "7", "9", "3", "1",
    "0", "5", "1", "1", "8", "5", "4", "8", "0", "7", "4", "4", "6", "2", "3", "7", "9",
    "9", "6", "2", "7", "4", "9", "5", "6", "7", "3", "5", "1", "8", "8", "5", "7", "5",
    "2", "7", "2", "4", "8", "9", "1", "2", "2", "7", "9", "3", "8", "1", "8", "3", "0",
    "1", "1", "9", "4", "9", "1", "2", "9", "8", "3", "3", "6", "7", "3", "3", "6", "2",
    "4", "4", "0", "6", "5", "6", "6", "4", "3", "0", "8", "6", "0", "2", "1", "3", "9",
    "4", "9", "4", "6", "3", "9", "5", "2", "2", "4", "7", "3", "7", "1", "9", "0", "7",
    "0", "2", "1", "7", "9", "8", "6", "0", "9", "4", "3", "7", "0", "2", "7", "7", "0",
    "5", "3", "9", "2", "1", "7", "1", "7", "6", "2", "9", "3", "1", "7", "6", "7", "5",
    "2", "3", "8", "4", "6", "7", "4", "8", "1", "8", "4", "6", "7", "6", "6", "9", "4",
    "0", "5", "1", "3", "2", "0", "0", "0", "5", "6", "8", "1", "2", "7", "1", "4", "5",
    "2", "6", "3", "5", "6", "0", "8", "2", "7", "7", "8", "5", "7", "7", "1", "3", "4",
    "2", "7", "5", "7", "7", "8", "9", "6", "0", "9", "1", "7", "3", "6", "3", "7", "1",
    "7", "8", "7", "2", "1", "4", "6", "8", "4", "4", "0", "9", "0", "1", "2", "2", "4",
    "9", "5", "3", "4", "3", "0", "1", "4", "6", "5", "4", "9", "5", "8", "5", "3", "7",
    "1", "0", "5", "0", "7", "9", "2", "2", "7", "9", "6", "8", "9", "2", "5", "8", "9",
    "2", "3", "5", "4", "2", "0", "1", "9", "9", "5", "6", "1", "1", "2", "1", "2", "9",
    "0", "2", "1", "9", "6", "0", "8", "6", "4", "0", "3", "4", "4", "1", "8", "1", "5",
    "9", "8", "1", "3", "6", "2", "9", "7", "7", "4", "7", "7", "1", "3", "0", "9", "9",
    "6", "0", "5", "1", "8", "7", "0", "7", "2", "1", "1", "3", "4", "9", "9", "9", "9",
    "9", "9", "8", "3", "7", "2", "9", "7", "8", "0", "4", "9", "9", "5", "1", "0", "5",
    "9", "7", "3", "1", "7", "3", "2", "8", "1", "6", "0", "9", "6", "3", "1", "8", "5",
    "9", "5", "0", "2", "4", "4", "5", "9", "4", "5", "5", "3", "4", "6", "9", "0", "8",
    "3", "0", "2", "6", "4", "2", "5", "2", "2", "3", "0", "8", "2", "5", "3", "3", "4",
    "4", "6", "8", "5", "0", "3", "5", "2", "6", "1", "9", "3", "1", "1", "8", "8", "1",
    "7", "1", "0", "1", "0", "0", "0", "3", "1", "3", "7", "8", "3", "8", "7", "5", "2",
    "8", "8", "6", "5", "8", "7", "5", "3", "3", "2", "0", "8", "3", "8", "1", "4", "2",
    "0", "6", "1", "7", "1", "7", "7", "6", "6", "9", "1", "4", "7", "3", "0", "3", "5",
    "9", "8", "2", "5", "3", "4", "9", "0", "4", "2", "8", "7", "5", "5", "4", "6", "8",
    "7", "3", "1", "1", "5", "9", "5", "6", "2", "8", "6", "3", "8", "8", "2", "3", "5",
    "3", "7", "8", "7", "5", "9", "3", "7", "5", "1", "9", "5", "7", "7", "8", "1", "8",
    "5", "7", "7", "8", "0", "5", "3", "2", "1", "7", "1", "2", "2", "6", "8", "0", "6",
    "6", "1", "3", "0", "0", "1", "9", "2", "7", "8", "7", "6", "6", "1", "1", "1", "9",
    "5", "9", "0", "9", "2", "1", "6", "4", "2", "0", "1", "9", "8"];

var PI_DRAWN = new Array(PI.length).fill(false);

