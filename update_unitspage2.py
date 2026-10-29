path = r"C:\resale-management-system\frontend\src\pages\UnitsPage.jsx"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

# Add useAuth import
old_import = "import { Link, useNavigate } from 'react-router-dom';"
new_import = "import { Link, useNavigate } from 'react-router-dom';\nimport { useAuth } from '../context/AuthContext';"
assert old_import in content, "router import not found"
content = content.replace(old_import, new_import)

# Add useAuth hook inside component - find the component start
old_comp = "const UnitsPage = () => {\n  const navigate = useNavigate();"
new_comp = "const UnitsPage = () => {\n  const navigate = useNavigate();\n  const { user, hasRole } = useAuth();\n  const isAgent = user?.role === 'agent';"
assert old_comp in content, "component start not found"
content = content.replace(old_comp, new_comp)

# Add phone request handler - add after handleWhatsApp
old_wa = """  const handleWhatsApp = (phone) => {
    if (phone) {
      const cleanPhone = phone.replace(/\\D/g, '');
      window.open(`https://wa.me/${cleanPhone}`, '_blank');
    }
  };"""

new_wa = """  const handleWhatsApp = (phone) => {
    if (phone) {
      const cleanPhone = phone.replace(/\\D/g, '');
      window.open(`https://wa.me/${cleanPhone}`, '_blank');
    }
  };

  const handleRequestPhone = async (unitId) => {
    try {
      await phoneAccessAPI.request(unitId);
      setError('');
      alert('Phone access request sent. Waiting for admin approval.');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to request phone access');
    }
  };"""

assert old_wa in content, "whatsapp handler not found"
content = content.replace(old_wa, new_wa)

# Update the owner column to add request phone button
old_owner = """                      <td className="px-6 py-4 hidden xl:table-cell">
                        <div className="text-sm">
                          <p className="font-medium text-gray-900">{unit.owner_name || '-'}</p>
                          {unit.owner_phone && (
                            <button
                              onClick={() => handleWhatsApp(unit.owner_phone)}
                              className="flex items-center gap-1 text-blue-600 hover:text-blue-500 text-xs mt-0.5"
                              title="WhatsApp"
                            >
                              <MessageSquare size={14} />
                              WhatsApp
                            </button>
                          )}
                        </div>
                      </td>"""

new_owner = """                      <td className="px-6 py-4 hidden xl:table-cell">
                        <div className="text-sm">
                          <p className="font-medium text-gray-900">{unit.owner_name || '-'}</p>
                          {unit.owner_phone && (
                            <div className="flex flex-col gap-1 mt-0.5">
                              <span className="text-gray-600 text-xs">{unit.owner_phone}</span>
                              {unit.phone_masked && isAgent ? (
                                <button
                                  onClick={() => handleRequestPhone(unit.id)}
                                  className="flex items-center gap-1 text-blue-600 hover:text-blue-500 text-xs"
                                  title="Request to view phone number"
                                >
                                  <Eye size={14} />
                                  Request Phone
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleWhatsApp(unit.owner_phone)}
                                  className="flex items-center gap-1 text-green-600 hover:text-green-500 text-xs"
                                  title="WhatsApp"
                                >
                                  <MessageSquare size={14} />
                                  WhatsApp
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </td>"""

assert old_owner in content, "owner column not found"
content = content.replace(old_owner, new_owner)

# Add Eye to lucide imports
old_lucide = "MoreHorizontal, MessageSquare, Edit, Trash2, Eye, Download, FileSpreadsheet, FileText"
# Eye already imported, check
if "Eye," not in content.split("from 'lucide-react'")[0]:
    pass

with open(path, "w", encoding="utf-8") as f:
    f.write(content)

print("UnitsPage.jsx owner column updated")
