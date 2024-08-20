let periodElement = document.getElementById('period0');
let totalTime = [];

window.onload = async function () {
    registerSW();
}

// Register the Service Worker
async function registerSW() {
    if ('serviceWorker' in navigator) {
        try {
            await navigator
                .serviceWorker
                .register('service-worker.js');
            console.log("SW registration successful");
        } catch (e) {
            console.log('SW registration failed: ', e);
        }
    }
}

window.clearWarning = function (event) {
    event.target.removeAttribute('aria-invalid');
    document.getElementById('storm').style.display = 'none';
    document.getElementById('sunrise').style.display = 'block';
}


window.sumPeriod = async function (index, event) {
    event.preventDefault();
    try {
        document.getElementById(`in${index}`).setAttribute('aria-invalid', 'false');
        document.getElementById(`out${index}`).setAttribute('aria-invalid', 'false');
        clearWarning(event);
        const inTime = document.getElementById(`in${index}`).value;
        const outTime = document.getElementById(`out${index}`).value;
        const sumPeriod = document.getElementById(`sumPeriod${index}`);
        const inTimeDate = new Date(`1970-01-01T${inTime}:00`);
        let outTimeDate = new Date(`1970-01-01T${outTime}:00`);
        if (outTimeDate < inTimeDate) {
            outTimeDate.setDate(outTimeDate.getDate() + 1);
        }
        const diffTime = outTimeDate.getTime() - inTimeDate.getTime();
        if (diffTime < 0) {
            // 86400000 é o número de milissegundos equivalente a um dia
            diffTime += 86400000;
            diffTime += 86400000;
        }
        // 3600000 é o número de milissegundos equivalente a uma hora
        const diffHours = Math.floor(diffTime / 3600000);
        // 60000 é o número de milissegundos equivalente a 1 minuto
        const diffMinutes = Math.floor((diffTime % 3600000) / 60000);

        totalTime[index] = diffHours + diffMinutes / 60;

        if (diffHours.toString() == 'NaN' || diffMinutes.toString() == 'NaN') {
            document.getElementById(`in${index}`).setAttribute('aria-invalid', 'true');
            document.getElementById(`out${index}`).setAttribute('aria-invalid', 'true');
        } else {
            sumPeriod.textContent = `${diffHours ? diffHours + 'h' : ''} ${diffMinutes ? diffMinutes + 'm' : ''}`
        }
        sumTotal();
    } catch (err) {
        console.log(err);
        document.getElementById(`in${index}`).setAttribute('aria-invalid', 'true');
        document.getElementById(`out${index}`).setAttribute('aria-invalid', 'true');
        document.getElementById('sunrise').style.display = 'none';
        document.getElementById('storm').style.display = 'block';
    }
}

window.copyPeriod = function (index, event) {
    event.preventDefault();
    const element = document.getElementById(`sumPeriod${index}`);
    const text = element.textContent;
    navigator.clipboard.writeText(text).then(() => {
        element.style.color = '#017fc0';
        setTimeout(() => element.style.color = '', 500);
    });
}

window.sumTotal = function () {
    let totalSum = totalTime.reduce((a, b) => a + b, 0);
    const hours = Math.trunc(totalSum);
    const minutes = Math.trunc((totalSum - hours) * 60);

    if (hours.toString() == 'NaN' || minutes.toString() == 'NaN') {
        document.getElementById('sumWorkTime').textContent = '--h --m';
    } else {
        document.getElementById('sumWorkTime').textContent = `${hours ? hours + 'h' : ''} ${minutes ? minutes + 'm' : ''}`;
    }
}


window.copyTotalWorkTime = function (event) {
    event.preventDefault();
    const element = document.getElementById('sumWorkTime');
    const text = element.textContent;
    navigator.clipboard.writeText(text).then(() => {
        element.style.color = 'white';
        setTimeout(() => element.style.color = '#017fc0', 500);
    });
}

window.addPeriod = function () {
    const periodList = document.getElementById('periodList');
    const newPeriod = periodElement.cloneNode(true);
    const index = periodList.children.length;
    newPeriod.id = `period${index}`;
    const inElement = newPeriod.querySelector('#in0');
    inElement.id = `in${index}`;
    const outElement = newPeriod.querySelector('#out0');
    outElement.id = `out${index}`;
    const sumPeriodElement = newPeriod.querySelector('#sumPeriod0');
    sumPeriodElement.id = `sumPeriod${index}`;

    inElement.setAttribute('onchange', `sumPeriod(${index}, event)`);
    outElement.setAttribute('onchange', `sumPeriod(${index}, event)`);
    newPeriod.setAttribute('onsubmit', `sumPeriod(${index}, event)`);
    const copyAnchorElement = newPeriod.querySelector('a');
    copyAnchorElement.setAttribute('onclick', `copyPeriod(${index}, event)`);
    periodList.appendChild(newPeriod);
    totalTime[index] = 0;
}