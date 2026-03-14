const rows = $input
  .all()
  .map((item) => item.json)
  .filter((row) => row && Object.keys(row).length > 0 && row.staff_id);

return [{ json: { staff_directory: rows } }];
