// 1. Model
let canvas, context, W, H;
let imagine, iW, iH;
let text, tdimensiune, tculoare, tx, ty; // tx, ty - coordonate punct start desenare text
let mx = 0, my = 0; // pozitie mouse
let xStart = 0, yStart = 0, xStop = 0, yStop = 0, selectieW, selectieH, x1 = 0, y1 = 0; //desenare selectie
let desenareSelectie = false;

// 2. Desenare
function desenare() {
    W = canvas.width;
    H = canvas.height;
    context.clearRect(0, 0, W, H);

    context.font = 'bold 14pt Times New Roman';
    context.textAlign = 'center';
    context.fillText('Plaseaza aici o fotografie', W / 2, H / 2);

    if (imagine.src != null && imagine.src != undefined && imagine.src != '') {
        iW = imagine.naturalWidth;
        iH = imagine.naturalHeight;

        let f = Math.max(H / iH, W / iW);
        context.drawImage(imagine, 0, 0, iW, iH,
            (W - iW * f) / 2, (H - iH * f) / 2, iW * f, iH * f);
    }

    // marcare selectie prin dreptunghi - initial tot canvasul
    context.beginPath();
    context.strokeRect(xStart, yStart, selectieW, selectieH);

    // scriere text
    if (text !== null && text !== undefined) {
        context.font = `${tdimensiune}pt Arial`;
        context.fillStyle = tculoare;
        context.fillText(text, tx, ty, W); // coord de desenare + maxWidth to draw
    }

    requestAnimationFrame(desenare);
}

// 3. Actualizare model - nu a fost nevoie, m-am folosit mereu de imagine

// 4. Tratare evenimente
function dropCanvas(e) {
    e.preventDefault();
    console.log(e.dataTransfer.files);
    imagine.src = URL.createObjectURL(e.dataTransfer.files[0]); // preiau mereu prima imagine din lista transmisa
    text = '';
}

function mouseMove(e) {
    mx = Math.round(e.x - canvas.getBoundingClientRect().x);
    my = Math.round(e.y - canvas.getBoundingClientRect().y);

    if (desenareSelectie === true) {
        setareCoordonate(x1, y1, mx, my);
    }
}

function mouseDown(e) {
    if (e.button === 0) {
        desenareSelectie = true;
        x1 = mx; y1 = my;
    }
}

function mouseUp(e) {
    if (e.button === 0) {
        desenareSelectie = false;
    }
}

function setareCoordonate(x1, y1, x2, y2) { //pt desenare dreptunghi selectie
    xStart = Math.min(x1, x2);
    yStart = Math.min(y1, y2);

    xStop = Math.max(x1, x2);
    yStop = Math.max(y1, y2);

    selectieW = xStop - xStart;
    selectieH = yStop - yStart;
}

function adaugaText() {
    text = document.getElementById("text").value;
    tdimensiune = document.getElementById("dimensiuneText").value;
    tculoare = document.getElementById("culoare").value;
    tx = document.getElementById("x").value;
    ty = document.getElementById("y").value;
    console.log(text, context.font, tculoare, tx, ty);

    document.getElementById("text").value = '';
    document.getElementById("dimensiuneText").value = '';
    document.getElementById("culoare").value = '';
    document.getElementById("x").value = '';
    document.getElementById("y").value = '';
}

function cropImagine() {
    let data = context.getImageData(xStart, yStart, selectieW, selectieH);
    xStart = 0;
    yStart = 0;
    context.clearRect(0, 0, W, H);
    canvas.width = selectieW;
    canvas.height = selectieH;
    context.putImageData(data, 0, 0);
    imagine.src = canvas.toDataURL();
}

function keyDown(e) {
    if (e.keyCode === 16) { // shift
        if (mx + selectieW / 2 > W) {
            xStart = W - selectieW;
        } else {
            xStart = Math.max(0, mx - selectieW / 2);
        }

        if (my + selectieH / 2 > H) {
            yStart = H - selectieH;
        } else {
            yStart = Math.max(0, my - selectieH / 2);
        }
    }
}

function modificaDimensiuniImagine() {
    let dimensiune = document.querySelector('#dimensiune');
    let valoare = parseInt(document.getElementById("valoare").value);
    if (isNaN(valoare) || valoare === 0) {
        alert("Valoarea dorita este un numar natural >0!")
    } else {
        if (dimensiune.value === "lungime") {
            canvas.height = valoare * canvas.height / canvas.width;
            canvas.width = valoare;
        } else {
            canvas.width = valoare * canvas.width / canvas.height;
            canvas.height = valoare;
        }
        xStart = 0;
        yStart = 0;
        selectieW = canvas.width;
        selectieH = canvas.height;
    }
}

function efectNegativ() {
    let pixeliSelectie = context.getImageData(xStart, yStart, selectieW, selectieH);
    for (let i = 0; i < pixeliSelectie.data.length; i += 4) {
        pixeliSelectie.data[i] = 255-pixeliSelectie.data[i];
        pixeliSelectie.data[i + 1] = 255-pixeliSelectie.data[i+1];
        pixeliSelectie.data[i + 2] = 255-pixeliSelectie.data[i+2];           
    }
    context.putImageData(pixeliSelectie, xStart, yStart);

    imagine.src = canvas.toDataURL();
}

function efectSepia() {
    let pixeliSelectie = context.getImageData(xStart, yStart, selectieW, selectieH);
    let data = pixeliSelectie.data;

    for (let i = 0; i < data.length; i += 4) {
        data[i + 0] = 0.393 * data[i + 0] + 0.769 * data[i + 1] + 0.189 * data[i + 2];
        data[i + 1] = 0.349 * data[i + 0] + 0.686 * data[i + 1] + 0.168 * data[i + 2];
        data[i + 2] = 0.272 * data[i + 0] + 0.534 * data[i + 1] + 0.131 * data[i + 2];
    }

    context.putImageData(pixeliSelectie, xStart, yStart);

    imagine.src = canvas.toDataURL();
}

function stergeSelectie() {
    //context.fillStyle = "#FFFFFF";
    //context.fillRect(xStart, yStart, selectieW, selectieH);
    // sau 
    let pixeliSelectie = context.getImageData(xStart, yStart, selectieW, selectieH);
    for (let i = 0; i < pixeliSelectie.data.length; i += 4) {
        pixeliSelectie.data[i] = 255;			 // rosu
        pixeliSelectie.data[i + 1] = 255;		 // verde
        pixeliSelectie.data[i + 2] = 255;		 // albastru
        //pixeliSelectie.data[i + 3]	 // transaparenta
    }
    context.putImageData(pixeliSelectie, xStart, yStart);

    imagine.src = canvas.toDataURL();
}

function salvareImg(e) {
    const dataURL = canvas.toDataURL();
    e.target.href = dataURL;
}

function aplicatie() {
    canvas = document.querySelector('canvas');
    W = canvas.width, H = canvas.height;
    selectieW = W, selectieH = H;
    context = canvas.getContext('2d');

    // incarcare imagine prin drag and drop + salvare 
    imagine = document.querySelector('img');
    canvas.addEventListener('dragover', e => e.preventDefault());
    canvas.addEventListener('drop', dropCanvas);

    let btnSalvare = document.getElementById("btnSalveaza");
    btnSalvare.addEventListener('click', salvareImg);

    // selectie
    canvas.addEventListener('mousemove', mouseMove);
    canvas.addEventListener('mousedown', mouseDown);
    canvas.addEventListener('mouseup', mouseUp);
    canvas.addEventListener('contextmenu', e => { // la click dreapta este selectat tot canvasul ca la inceput
        e.preventDefault();
        xStart = 0; yStart = 0;
        selectieW = W; selectieH = H;
    })

    //crop 
    let btnCrop = document.getElementById("btnCrop");
    btnCrop.addEventListener('click', cropImagine);

    //adaugare text
    let btnText = document.getElementById("btnAdaugaText");
    btnText.addEventListener('click', adaugaText);

    // scalare
    let btnScalare = document.getElementById("btnScalare");
    btnScalare.addEventListener('click', modificaDimensiuniImagine);

    //mutare selectie (mouse+shift)
    canvas.addEventListener('keydown', keyDown, true);

    //stergere selectie
    let btnStergere = document.getElementById("btnStergere");
    btnStergere.addEventListener('click', stergeSelectie);

    //aplicare efecte negativ si sepia
    let btnNegativ = document.getElementById("btnNegativ");
    btnNegativ.addEventListener('click', efectNegativ);

    let btnSepia = document.getElementById('btnSepia');
    btnSepia.addEventListener('click', efectSepia);

    desenare();
}

document.addEventListener('DOMContentLoaded', aplicatie);