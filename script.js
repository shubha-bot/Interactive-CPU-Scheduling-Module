let processList = [];
let isCalculated = false;
let currentWaterfallStep = 'requirements';// it will start with requirements 
 let result = [];

function advanceWaterfall() {
    const steps = ['requirements', 'design', 'implementation', 'testing', 'deployment', 'maintenance'];
    const currentIndex = steps.indexOf(currentWaterfallStep);

    if (currentIndex < steps.length - 1) {
        const currentStepElement = document.getElementById(currentWaterfallStep);
        if (currentStepElement) {
            currentStepElement.classList.remove('active');
            currentStepElement.classList.add('completed');
        }
        currentWaterfallStep = steps[currentIndex + 1];
        const nextStepElement = document.getElementById(currentWaterfallStep);
        if (nextStepElement) {
            nextStepElement.classList.add('active');
        }
    } else if (currentIndex === steps.length - 1) {
        const currentStepElement = document.getElementById(currentWaterfallStep);
        if (currentStepElement) {
            currentStepElement.classList.remove('active');
            currentStepElement.classList.add('completed');
        }
        alert("Waterfall model visualization completed!");
    }
}

document.getElementById("schedulingAlgorithm").addEventListener("change", function () {
    document.getElementById("timeQuantum").style.display = this.value === "RR" ? "inline-block" : "none";
});// for RR we requied for quantum time so whenever we click RR it will show timequantum option with options

function addProcess() {
    let processID = processList.length + 1;// giving numbering to the process id for 1 to... length of the array
    let arrivalTime = prompt(`Enter Arrival Time for Process ${processID}:`);
    let burstTime = prompt(`Enter Burst Time for Process ${processID}:`);

    if (!isValidInput(arrivalTime) || !isValidInput(burstTime)) {
        alert("Invalid Input! Please enter valid positive integers.");
        return;
    }// giving validation to the input so that only positive number will be provided by the user

    arrivalTime = parseInt(arrivalTime);
    burstTime = parseInt(burstTime); // input should be numeric not alphabetic

    if (arrivalTime < 0 || burstTime <= 0) {
        alert("Arrival time must be non-negative, and burst time must be positive.");
        return;
    }

    const isFirstProcess = processList.length === 0; // if zero inputs is provided 
    processList.push({ id: processID, arrival: arrivalTime, burst: burstTime, remainingBurst: burstTime });
    updateProcessTable(); //pushing the items and updating it
    isCalculated = false;

    if (isFirstProcess) {
        advanceWaterfall(); // Move from 'requirements' to 'design'
    }
}



function isValidInput(value) {
    return value && /^\d+$/.test(value);// /^\d+%$/ symbols should not use
}

function updateProcessTable() {
    let table = document.getElementById("processTable");
    table.innerHTML = "";
    processList.forEach(process => {   //for loop for each process that will be input
        table.innerHTML += `<tr><td>${process.id}</td><td>${process.arrival}</td><td>${process.burst}</td></tr>`;
    }); //input by user in table
}

function goToSolution() {
    // Store process results in localStorage
    localStorage.setItem('schedulingResults', JSON.stringify(result));
    window.location.href = 'solution.html';
}


function calculateScheduling() {
    if (isCalculated) {
        alert("Please add a new process before calculating again!");
        return;
    }

    advanceWaterfall(); // Move to 'implementation'

    const algorithm = document.getElementById("schedulingAlgorithm").value;
    const timeQuantum = parseInt(document.getElementById("timeQuantum").value);
   
    let currentTime = 0;
    let completed = 0;
    let processQueue = [];

    let processes = processList.map(p => ({ ...p }));

    while (completed < processes.length) {
        let available = processes.filter(p => p.arrival <= currentTime && p.remainingBurst > 0);

        if (available.length === 0) {
            currentTime++;
            continue;
        }

        let currentProcess;
        if (algorithm === "FCFS") {
            currentProcess = available.sort((a, b) => a.arrival - b.arrival)[0];
        } else if (algorithm === "SJF") {
            currentProcess = available.sort((a, b) => a.burst - b.burst)[0];
        } else if (algorithm === "SRTF") {
            currentProcess = available.sort((a, b) => a.remainingBurst - b.remainingBurst)[0];
        } else if (algorithm === "RR") {
            if (processQueue.length === 0) {
                processQueue = available;
            }
            currentProcess = processQueue.shift();
        }

        const startTime = currentTime;
        let executionTime = algorithm === "RR" ? Math.min(timeQuantum, currentProcess.remainingBurst) : currentProcess.remainingBurst;
        currentTime += executionTime;
        currentProcess.remainingBurst -= executionTime;

        if (currentProcess.remainingBurst === 0) {
            completed++;
            result.push({
                id: currentProcess.id,
                start: startTime,
                completion: currentTime,
                arrival: currentProcess.arrival,
                burst: currentProcess.burst
            });
        } else if (algorithm === "RR") {
            processQueue.push(currentProcess);
        }
    }

    displayResults(result);
    isCalculated = true;
    advanceWaterfall(); // Move to 'testing'
}

function displayResults(results) {
    const table = document.getElementById("resultTable");
    table.innerHTML = "";

    let wtList = [], tatList = [], ids = [], totalBurst = 0;
    let totalTat = 0, totalWt = 0;
    const totalCompletion = results[results.length - 1].completion;

    results.forEach(p => {
        const tat = p.completion - p.arrival;
        const wt = tat - p.burst;
        totalTat += tat;
        totalWt += wt;
        totalBurst += p.burst;
        wtList.push(wt);
        tatList.push(tat);
        ids.push("P" + p.id);

        table.innerHTML += `<tr>
            <td>${p.id}</td>
            <td>${p.start}</td>
            <td>${p.completion}</td>
            <td>${tat}</td>
            <td>${wt}</td>
        </tr>`;
    });

    const avgTat = totalTat / results.length;
    const avgWt = totalWt / results.length;
    const throughput = results.length / totalCompletion;
    const cpuUtil = (totalBurst / totalCompletion) * 100;

    document.getElementById("averages").innerText =
        `Average Turnaround Time: ${avgTat.toFixed(2)}; Average Waiting Time: ${avgWt.toFixed(2)}; Throughput: ${throughput.toFixed(2)}; CPU Utilization: ${cpuUtil.toFixed(2)}%`;

    drawCharts(ids, wtList, tatList, cpuUtil, avgTat, avgWt, throughput);
    advanceWaterfall(); // Move to 'deployment'
}

function drawCharts(labels, wt, tat, cpuUtil, avgTat, avgWt, throughput) {
    const createChart = (id, type, label, data) => {
        new Chart(document.getElementById(id), {
            type,
            data: {
                labels,
                datasets: [{
                    label,
                    data,
                    backgroundColor: generateColors(data.length)
                }]
            }
        });
    };

    const generateColors = n => Array.from({ length: n }, (_, i) => `hsl(${(i * 360 / n)}, 70%, 60%)`);

    createChart("wtPieChart", "pie", "Waiting Time", wt);
    createChart("tatPieChart", "pie", "Turnaround Time", tat);
    createChart("wtBarChart", "bar", "Waiting Time", wt);
    createChart("tatBarChart", "bar", "Turnaround Time", tat);
    createChart("performanceBarChart", "bar", "Performance", [cpuUtil, avgTat, avgWt, throughput]);

    advanceWaterfall(); // Move to 'maintenance'
}
