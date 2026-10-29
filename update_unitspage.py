import re

path = r"C:\resale-management-system\frontend\src\pages\UnitsPage.jsx"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Update import to add imagesAPI and phoneAccessAPI
old_import = "import { unitsAPI, developersAPI, compoundsAPI, exportAPI } from '../services/api';"
new_import = "import { unitsAPI, developersAPI, compoundsAPI, exportAPI, imagesAPI, phoneAccessAPI } from '../services/api';"
assert old_import in content, "import not found"
content = content.replace(old_import, new_import)

# 2. Replace handleSubmit
old_handle = """  const handleSubmit = async (data) => {
    setSubmitting(true);
    try {
      // Remove server-only fields that shouldn't be sent back
      const { id, created_by, created_at, updated_at, developer_name, compound_name, created_by_name, ...cleanData } = data;
      if (editingUnit) {
        await unitsAPI.update(editingUnit.id, cleanData);
      } else {
        await unitsAPI.create(cleanData);
      }
      setShowForm(false);
      setEditingUnit(null);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save unit');
    } finally {
      setSubmitting(false);
    }
  };"""

new_handle = """  const handleSubmit = async (data, images = []) => {
    setSubmitting(true);
    try {
      // Remove server-only fields that shouldn't be sent back
      const { id, created_by, created_at, updated_at, developer_name, compound_name, created_by_name, ...cleanData } = data;
      let unitId;
      if (editingUnit) {
        await unitsAPI.update(editingUnit.id, cleanData);
        unitId = editingUnit.id;
      } else {
        const res = await unitsAPI.create(cleanData);
        unitId = res.data.unit.id;
      }
      // Upload images if any
      if (images && images.length > 0 && unitId) {
        await imagesAPI.upload(unitId, images);
      }
      setShowForm(false);
      setEditingUnit(null);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save unit');
    } finally {
      setSubmitting(false);
    }
  };"""

assert old_handle in content, "handleSubmit not found"
content = content.replace(old_handle, new_handle)

with open(path, "w", encoding="utf-8") as f:
    f.write(content)

print("UnitsPage.jsx updated successfully")
