const ExcelJS = require("exceljs");

function exportExcel(data = []) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Data Export");

  // Define columns
  worksheet.columns = [
    { header: "Time In", key: "time", width: 30 },
    { header: "Gate", key: "device_id", width: 30 },
    { header: "Driver Name", key: "driver_name", width: 30 },
    { header: "Driver ID", key: "driver_id", width: 30 },
    { header: "IP Response Status", key: "response_status", width: 30 },
  ];

  // Add data rows
  data.forEach((row) => {
    worksheet.addRow({
      time: row.time.toLocaleString("id-ID"),
      device_id: row.device_id,
      driver_name: row.driver_name,
      driver_id: row.driver_id,
      response_status: row.response_status,
    });
  });

  // Style the header row
  worksheet.getRow(1).font = { bold: true };
  worksheet.getRow(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFE0E0E0" },
  };

  return workbook;
}

module.exports = exportExcel;
