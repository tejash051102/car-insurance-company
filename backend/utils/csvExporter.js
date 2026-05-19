const escapeCsv = (value) => {
  if (value === null || value === undefined) return "";
  const text = String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

export const sendCsv = (res, filename, columns, rows) => {
  const header = columns.map((column) => escapeCsv(column.label)).join(",");
  const body = rows
    .map((row) => columns.map((column) => escapeCsv(column.value(row))).join(","))
    .join("\n");

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", `attachment; filename=${filename}`);
  res.send(`${header}\n${body}`);
};
