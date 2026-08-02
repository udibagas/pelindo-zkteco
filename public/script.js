let path = "transactions";
const form = document.querySelector("form");
const tableDataEl = document.querySelector("#table-data");
const loadingEl = document.querySelector("#loading-overlay");

// table summary
const dataFromEl = document.querySelector("#data-from");
const dataToEl = document.querySelector("#data-to");
const totalEl = document.querySelector("#total");

// pagination button
const prevBtn = document.querySelector("#prev-btn");
const nextBtn = document.querySelector("#next-btn");

// page is not maintain in the form
let page = 1;

function getFormData() {
  const formData = new FormData(form);
  return Object.fromEntries(formData);
}

function goToNext() {
  page += 1;
  fetchData();
}

function goToPrev() {
  page -= 1;
  fetchData();
}

async function fetchData() {
  const params = getFormData();
  const queryString = new URLSearchParams({ ...params, page }).toString();
  const url = `/${path}?${queryString}`;

  setLoading(true);

  try {
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.status == 200) {
      const { rows, total, dataFrom, dataTo, nextPage, prevPage } =
        await response.json();
      renderTableData(rows);
      renderTableSummary(total, dataFrom, dataTo);
      updatePaginationLinkState(nextPage, prevPage);
    }
  } catch (error) {
    console.log(error);
    console.error(error.message);
  } finally {
    setLoading(false);
  }
}

function refreshData() {
  page = 1;
  fetchData();
}

function exportToExcel() {
  const params = getFormData();
  const queryString = new URLSearchParams({
    ...params,
    action: "export",
  }).toString();
  const url = `${window.location.origin}/${path}?${queryString}`;
  window.open(url, "_blank");
}

function renderTableData(rows) {
  const tableDataContent = [];

  for (const r of rows) {
    let row = `
      <tr onclick="showDetail('${r.id}')">
        <td>${new Date(r.Time).toLocaleString("id-ID", { timeZone: "Asia/Jakarta" })}</td>
        <td>${r.Gate}</td>
        <td>${r["Driver Name"]}</td>
        <td>${r["Driver ID"]}</td>
    `;

    if (path == "logs") {
      row += `
        <td style="text-align: center;">
          <span class="status ${r.status === true ? "success" : r.status === false ? "failed" : "pending"}">
            ${r.status === true ? "Success" : r.status === false ? "Failed" : "Pending"}
          </span>
        </td>
      `;
    }

    row += "</tr>";

    tableDataContent.push(row);
  }

  tableDataEl.innerHTML = tableDataContent.join("\n");
}

async function showDetail(id) {
  const dialog = document.querySelector("dialog");
  const detailEl = document.querySelector("#detail");
  if (!detailEl) return;

  const res = await fetch(`/${path}/${id}`, {
    headers: {
      "Content-Type": "application/json",
    },
  });

  const data = await res.json();
  detailEl.innerHTML = JSON.stringify(data, null, 2);
  dialog.showModal();
}

function renderTableSummary(total, from, to) {
  dataFromEl.innerHTML = from;
  dataToEl.innerHTML = to;
  totalEl.innerHTML = total;
}

function updatePaginationLinkState(nextPage, prevPage) {
  if (!nextPage) {
    nextBtn.setAttribute("disabled", "");
  } else {
    nextBtn.removeAttribute("disabled");
  }

  if (!prevPage) {
    prevBtn.setAttribute("disabled", "");
  } else {
    prevBtn.removeAttribute("disabled");
  }
}

function setLoading(show) {
  loadingEl.style.display = show ? "flex" : "none";
}

function renderLog(log) {
  const logContainer = document.querySelector("#log-container");
  const date = new Date(log.timestamp).toLocaleString("id-ID", {
    timeZone: "Asia/Jakarta",
  });

  logContainer.innerHTML += `
    <p>
      [${date}] [${log.level.toUpperCase()}] ${log.message}
    </p>
  `;

  logContainer.scrollTop = logContainer.scrollHeight;
}

// WebSocket connection for live update
const host = window.location.host.split(":")[0];
const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
const wsUrl = `${protocol}//${host}:8090`;
const socket = new WebSocket(wsUrl);

socket.onmessage = (event) => {
  const log = JSON.parse(event.data);

  if (log.message.includes("New notification")) {
    const prefixLength = "New notification: ".length;
    let data = log.message.slice(prefixLength);
    data = JSON.parse(data);
    const userInfo = document.querySelector(`#userinfo${data.dev_id}`);

    if (userInfo) {
      if (data.name) {
        userInfo.innerHTML = data.name;
        userInfo.style.backgroundColor = "green";
      } else {
        userInfo.innerHTML = "Unregistered";
        userInfo.style.backgroundColor = "orange";
      }

      setTimeout(() => {
        userInfo.innerHTML = "No face detected";
        userInfo.style.backgroundColor = "red";
      }, 10000);
    }

    fetchData();
  }

  renderLog(log);
};

socket.onopen = () => {
  console.log("WebSocket connection established!!!");
};

socket.onclose = () => {
  console.log("WebSocket connection closed!!!");
};

socket.onerror = (error) => {
  console.error("WebSocket error:", error.message);
};
