document.addEventListener("DOMContentLoaded", function () {
  let simulationData = [];
  const definitions = {
    qps: "Queries Per Second (QPS) is a measure of the rate of traffic serving or data processing.",
    storage:
      "Storage refers to the amount of data that needs to be persistently stored in the system.",
    bandwidth:
      "Bandwidth is the maximum rate of data transfer across a given path in the network.",
    loadBalancer:
      "Load balancer capacity is the ability to distribute network traffic across multiple servers.",
    cumulativeStorage:
      "Cumulative storage represents the total amount of data accumulated over time.",
    multiNodeBandwidth:
      "Multi-node bandwidth estimates data transfer between multiple interconnected nodes or data centers.",
    geoDistribution:
      "Geographical distribution considers how a service is spread and accessed across different regions.",
    computeResources:
      "Computational resources represent the processing power required for complex operations.",
    baseValue: "The initial value or starting point for the estimation.",
    growthRate:
      "The rate at which the base value is expected to increase over time.",
    variability:
      "The degree of fluctuation or deviation from the expected value.",
    duration: "The time period over which the simulation is run.",
    peakFactor:
      "A multiplier used to estimate maximum load during peak usage times.",
    compressionFactor:
      "The ratio by which data can be reduced in size through compression techniques.",
    averageDataSize:
      "The typical size of a single piece of data or transaction in the system.",
  };

  function setup() {
    const chartDiv = document.getElementById("chart");
    const canvas = createCanvas(600, 300);
    canvas.parent(chartDiv);
  }

  function draw() {
    if (simulationData.length > 0) {
      background(244, 244, 244);
      const maxVal = Math.max(...simulationData);
      const minVal = Math.min(...simulationData);

      stroke(26, 26, 26);
      line(50, 250, 550, 250); // x-axis
      line(50, 250, 50, 50); // y-axis

      noFill();
      stroke(74, 144, 226);
      beginShape();
      for (let i = 0; i < simulationData.length; i++) {
        const x = map(i, 0, simulationData.length - 1, 50, 550);
        const y = map(simulationData[i], minVal, maxVal, 250, 50);
        vertex(x, y);
      }
      endShape();

      // Add labels
      fill(26, 26, 26);
      textSize(12);
      text("Time", 300, 280);
      push();
      translate(30, 150);
      rotate(-HALF_PI);
      text("Value", 0, 0);
      pop();
    }
  }

  function updateDynamicInputs() {
    const estimationType = document.getElementById("estimationType").value;
    const dynamicInputs = document.getElementById("dynamicInputs");
    dynamicInputs.innerHTML = "";

    const commonInputs = `
            <label for="baseValue" class="tooltip">Base Value:
                <span class="tooltiptext">${definitions.baseValue}</span>
            </label>
            <input type="number" id="baseValue" required>
            <label for="growthRate" class="tooltip">Annual Growth Rate (%):
                <span class="tooltiptext">${definitions.growthRate}</span>
            </label>
            <input type="number" id="growthRate" required>
            <label for="variability" class="tooltip">Variability (%):
                <span class="tooltiptext">${definitions.variability}</span>
            </label>
            <input type="number" id="variability" required>
            <label for="duration" class="tooltip">Simulation Duration (years):
                <span class="tooltiptext">${definitions.duration}</span>
            </label>
            <input type="number" id="duration" required>
        `;

    dynamicInputs.innerHTML = commonInputs;

    if (estimationType === "qps") {
      dynamicInputs.innerHTML += `
                <label for="peakFactor" class="tooltip">Peak Factor:
                    <span class="tooltiptext">${definitions.peakFactor}</span>
                </label>
                <input type="number" id="peakFactor" step="0.1" required>
            `;
    } else if (estimationType === "storage") {
      dynamicInputs.innerHTML += `
                <label for="compressionFactor" class="tooltip">Compression Factor:
                    <span class="tooltiptext">${definitions.compressionFactor}</span>
                </label>
                <input type="number" id="compressionFactor" step="0.1" required>
            `;
    } else if (estimationType === "bandwidth") {
      dynamicInputs.innerHTML += `
                <label for="averageDataSize" class="tooltip">Average Data Size (KB):
                    <span class="tooltiptext">${definitions.averageDataSize}</span>
                </label>
                <input type="number" id="averageDataSize" required>
            `;
    } else if (estimationType === "loadBalancer") {
      dynamicInputs.innerHTML += `
                <label for="serverCapacity" class="tooltip">Single Server Capacity (requests/second):
                    <span class="tooltiptext">Maximum number of requests a single server can handle per second</span>
                </label>
                <input type="number" id="serverCapacity" required>
            `;
    } else if (estimationType === "cumulativeStorage") {
      dynamicInputs.innerHTML += `
                <label for="dailyAddition" class="tooltip">Daily Addition (GB):
                    <span class="tooltiptext">Amount of data added daily</span>
                </label>
                <input type="number" id="dailyAddition" required>
            `;
    } else if (estimationType === "multiNodeBandwidth") {
      dynamicInputs.innerHTML += `
                <label for="nodeCount" class="tooltip">Number of Nodes:
                    <span class="tooltiptext">Number of data centers or nodes</span>
                </label>
                <input type="number" id="nodeCount" required>
            `;
    } else if (estimationType === "geoDistribution") {
      dynamicInputs.innerHTML += `
                <label for="regionCount" class="tooltip">Number of Regions:
                    <span class="tooltiptext">Number of geographical regions</span>
                </label>
                <input type="number" id="regionCount" required>
            `;
    } else if (estimationType === "computeResources") {
      dynamicInputs.innerHTML += `
                <label for="operationsPerQuery" class="tooltip">Operations per Query:
                    <span class="tooltiptext">Number of operations for each query</span>
                </label>
                <input type="number" id="operationsPerQuery" required>
            `;
    }
  }

  document
    .getElementById("estimationType")
    .addEventListener("change", updateDynamicInputs);
  updateDynamicInputs();

  window.runSimulation = function () {
    const estimationType = document.getElementById("estimationType").value;
    const baseValue = parseFloat(document.getElementById("baseValue").value);
    const growthRate =
      parseFloat(document.getElementById("growthRate").value) / 100;
    const variability =
      parseFloat(document.getElementById("variability").value) / 100;
    const duration = parseInt(document.getElementById("duration").value);

    let additionalFactor = 1;
    if (estimationType === "qps") {
      additionalFactor = parseFloat(
        document.getElementById("peakFactor").value,
      );
    } else if (estimationType === "storage") {
      additionalFactor = parseFloat(
        document.getElementById("compressionFactor").value,
      );
    } else if (estimationType === "bandwidth") {
      additionalFactor =
        parseFloat(document.getElementById("averageDataSize").value) / 1000;
    } else if (estimationType === "loadBalancer") {
      additionalFactor = parseFloat(
        document.getElementById("serverCapacity").value,
      );
    } else if (estimationType === "cumulativeStorage") {
      additionalFactor = parseFloat(
        document.getElementById("dailyAddition").value,
      );
    } else if (estimationType === "multiNodeBandwidth") {
      additionalFactor = parseInt(document.getElementById("nodeCount").value);
    } else if (estimationType === "geoDistribution") {
      additionalFactor = parseInt(document.getElementById("regionCount").value);
    } else if (estimationType === "computeResources") {
      additionalFactor = parseFloat(
        document.getElementById("operationsPerQuery").value,
      );
    }

    simulationData = [];
    let currentValue = baseValue;
    let cumulativeValue = 0;

    for (let year = 0; year < duration; year++) {
      for (let day = 0; day < 365; day++) {
        let growthFactor = 1 + growthRate / 365;
        if (estimationType === "qps" || estimationType === "bandwidth") {
          let maxCapacity = baseValue * 10;
          growthFactor =
            1 + (growthRate * (1 - currentValue / maxCapacity)) / 365;
        }

        let seasonalFactor = 1 + 0.1 * Math.sin(2 * Math.PI * (day / 365));
        let dailyVariation = 1 + randn_bm() * variability;

        let simulatedValue =
          currentValue * growthFactor * seasonalFactor * dailyVariation;

        if (estimationType === "qps") {
          simulatedValue *= additionalFactor;
        } else if (estimationType === "storage") {
          simulatedValue /= additionalFactor;
        } else if (estimationType === "bandwidth") {
          simulatedValue *= additionalFactor;
        } else if (estimationType === "loadBalancer") {
          simulatedValue = Math.ceil(simulatedValue / additionalFactor);
        } else if (estimationType === "cumulativeStorage") {
          cumulativeValue += additionalFactor * dailyVariation;
          simulatedValue = cumulativeValue;
        } else if (estimationType === "multiNodeBandwidth") {
          simulatedValue *= Math.sqrt(additionalFactor);
        } else if (estimationType === "geoDistribution") {
          simulatedValue *= Math.log2(additionalFactor);
        } else if (estimationType === "computeResources") {
          simulatedValue *= additionalFactor;
        }

        simulationData.push(simulatedValue);
        currentValue *= growthFactor;
      }
    }

    const average =
      simulationData.reduce((a, b) => a + b) / simulationData.length;
    const max = Math.max(...simulationData);

    let resultText = `Average ${estimationType}: ${average.toFixed(2)}\n`;
    resultText += `Peak ${estimationType}: ${max.toFixed(2)}\n`;

    if (estimationType === "qps") {
      resultText += `Estimated peak QPS: ${max.toFixed(2)}`;
    } else if (estimationType === "storage") {
      resultText += `Estimated max storage need: ${max.toFixed(2)} GB`;
    } else if (estimationType === "bandwidth") {
      resultText += `Estimated peak bandwidth: ${max.toFixed(2)} Mbps`;
    } else if (estimationType === "loadBalancer") {
      resultText += `Estimated max number of servers needed: ${Math.ceil(max)}`;
    } else if (estimationType === "cumulativeStorage") {
      resultText += `Total accumulated storage: ${max.toFixed(2)} GB`;
    } else if (estimationType === "multiNodeBandwidth") {
      resultText += `Peak total network traffic: ${max.toFixed(2)} Gbps`;
    } else if (estimationType === "geoDistribution") {
      resultText += `Peak distributed load: ${max.toFixed(2)} units`;
    } else if (estimationType === "computeResources") {
      resultText += `Peak computational need: ${max.toFixed(2)} operations per second`;
    }

    document.getElementById("results").innerText = resultText;
  };

  // Box-Muller transform for normal distribution
  function randn_bm() {
    let u = 0,
      v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  }

  // Call setup after the DOM is fully loaded
  setup();
});
