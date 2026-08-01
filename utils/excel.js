const ExcelJS = require("exceljs");

function exportExcel(data = [], withStatus = true) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Data Export");

  const columns = [
    {
      header: "Time In",
      key: "Time",
      width: 30,
    },
    {
      header: "Gate",
      key: "Gate",
      width: 30,
    },
    {
      header: "Driver Name",
      key: "Driver Name",
      width: 30,
    },
    {
      header: "Driver ID",
      key: "Driver ID",
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
