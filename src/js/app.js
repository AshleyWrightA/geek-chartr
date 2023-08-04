import { Chart } from "chart.js/auto";

export default function initApp() {
  const chart = makeInitialChart();

  getDateData(chart);
  getBoardgameData(chart).then((success) => {
    if (!success) {
      handleFailedDisplay();
    } else {
      handleSuccessDisplay();
    }
  });
}

async function getBoardgameData(chart) {
  let success;
  try {
    const boardgameRes = await fetch("http://3.99.226.95:3000/boardgame");
    if (!boardgameRes.ok) {
      throw new Error("Failed to fetch boardgames!");
    }
    const boardgameData = await boardgameRes.json();
    updateChartDatasets(chart, boardgameData);
    success = true;
  } catch (err) {
    console.error(err);
    success = false;
  }
  return success;
}

async function getDateData(chart) {
  try {
    const dateRes = await fetch("http://3.99.226.95:3000/date");
    if (!dateRes.ok) {
      throw new Error("Failed to fetch dates!");
    }
    const dateData = await dateRes.json();
    updateChartLabels(chart, dateData.dateArray);
  } catch (err) {
    console.error(err);
  }
}

function makeInitialChart() {
  const CANVAS_CTX = document.getElementById("boardgame__canvas").getContext("2d");
  const chart = new Chart(CANVAS_CTX, {
    type: "line",
    data: {
      labels: [],
      datasets: [],
    },
    options: {
      plugins: {
        legend: {
          labels: {
            font: {
              size: 15,
            },
          },
        },
      },
    },
  });
  chart.options.plugins.legend.position = "right";
  return chart;
}

function updateChartLabels(chart, jsonData) {
  jsonData.forEach((date) => {
    chart.data.labels.push(date);
  });
  chart.update();
}

function updateChartDatasets(chart, jsonData) {
  jsonData.forEach((boardGame) => {
    chart.data.datasets.push({
      label: boardGame.boardGameInfo.name,
      borderColor: boardGame.boardGameInfo.rgbString,
      data: [],
      tension: 0.2,
    });
    boardGame.plays.forEach((playDateObject) => {
      chart.data.labels.forEach((date) => {
        if (playDateObject.date === date) {
          chart.data.datasets[chart.data.datasets.length - 1].data.push(playDateObject.play);
        }
      });
    });
  });

  chart.update();
}

function handleSuccessDisplay() {
  const loaderContainer = document.querySelector(".loader__container-visible");
  const mainSection = document.querySelector(".main__section-invisible");
  const canvas = document.querySelector("#boardgame__canvas");

  loaderContainer.classList.add("loader__container-invisible");
  loaderContainer.classList.remove("loader__container-visible");

  mainSection.classList.add("main__section-visible");
  mainSection.classList.remove("main__section-invisible");

  // Directly setting this overwrites the canvas elements width property, which conflicts with the css style.width
  canvas.style.width = "85vw";
}

function handleFailedDisplay() {
  const loaderContainer = document.querySelector(".loader__container-visible");
  const failedContainer = document.querySelector(".failed__container-invisible");

  loaderContainer.classList.add("loader__container-invisible");
  loaderContainer.classList.remove("loader__container-visible");

  failedContainer.classList.add("failed__container-visible");
  failedContainer.classList.remove("failed__container-invisible");
}
