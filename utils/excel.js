const ExcelJS = require("exceljs");

function exportExcel(data = [], withStatus = true) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Data Export");

  const columns = [
    {
      header: "Time In",
      key: "time",
      width: 30,
    },
    {
      header: "Gate",
      key: "gate",
      width: 30,
    },
    {
      header: "Driver Name",
      key: "driver_name",
      width: 30,
    },
    {
      header: "Driver ID",
      key: "driver_id",
      width: 30,
    },
  ];

  if (withStatus) {
    columns.push({
      header: "API Response Status",
      key: "status",
      width: 30,
    });
  }

  worksheet.columns = columns;

  data.forEach((row) => {
    worksheet.addRow(row);
  });

  worksheet.getRow(1).font = { bold: true };
  worksheet.getRow(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFE0E0E0" },
  };

  return workbook;
}

module.exports = exportExcel;
