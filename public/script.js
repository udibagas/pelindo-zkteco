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
