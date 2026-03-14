const rows = $input
  .all()
  .map((item) => item.json)
  .filter((row) => row && Object.keys(row).length > 0 && row.family_id);

return [{ json: { family_directory: rows } }];
