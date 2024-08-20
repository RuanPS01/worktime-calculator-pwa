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
    console.log(`[sumPeriod] index: ${index}`);
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
            diffTime += 24 * 60 * 60 * 1000;
        }

        totalTime[index] = diffTime;

        if (isNaN(diffTime)) {
            document.getElementById(`in${index}`).setAttribute('aria-invalid', 'true');
            document.getElementById(`out${index}`).setAttribute('aria-invalid', 'true');
            document.getElementById('sunrise').style.display = 'none';
            document.getElementById('storm').style.display = 'block';
        } else {
            sumPeriod.textContent = `${diffTime ? formatTime(diffTime) : '0h 0m'}`
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

function formatTime(milliseconds) {
    const hours = Math.floor(milliseconds / (60 * 60 * 1000));
    const minutes = Math.floor((milliseconds % (60 * 60 * 1000)) / (60 * 1000));

    return `${hours ? hours + 'h' : ''} ${minutes ? minutes + 'm' : ''}`;
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
    let timeText;

    if (isNaN(totalSum)) {
        timeText = '--h --m';
    } else if (!totalSum) {
        timeText = '0h 0m';
    } else {
        timeText = formatTime(totalSum);
    }

    document.getElementById('sumWorkTime').textContent = timeText;

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

    const copyAnchorElement = newPeriod.querySelector('#copyPeriod0');
    copyAnchorElement.id = `copyPeriod${index}`;
    copyAnchorElement.setAttribute('onclick', `copyPeriod(${index}, event)`);

    const deleteElement = newPeriod.querySelector('#deletePeriod0');
    deleteElement.id = `deletePeriod${index}`;
    deleteElement.style = 'margin-right: 10px; opacity: 1; cursor: pointer;';
    deleteElement.setAttribute('onclick', `deletePeriod(${index}, event)`);

    periodList.appendChild(newPeriod);
    totalTime[index] = 0;
    sumPeriod(index, event);
    sumTotal();
}

window.deletePeriod = function (index, event) {
    event.preventDefault();
    const periodList = document.getElementById('periodList');
    const periodElement = periodList.querySelector(`#period${index}`);
    periodList.removeChild(periodElement);
    totalTime.splice(index, 1);
    sumTotal();
}