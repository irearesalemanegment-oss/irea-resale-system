const XLSX = require('xlsx');
const { PDFDocument, StandardFonts, rgb } = require('pdf-lib');
const db = require('../database/pool');

const exportUnitsToCSV = async (req, res) => {
  try {
    const { developer_id, compound_id, status } = req.query;

    let query = `
      SELECT 
        u.unit_number,
        d.name AS developer_name,
        c.name AS compound_name,
        u.unit_type,
        u.offering_type,
        u.land_area,
        u.bua,
        u.description,
        u.price,
        u.state,
        u.materials,
        u.material_link,
        u.owner_name,
        u.owner_phone,
        u.owner_email,
        u.status,
        u.created_at
      FROM units u
      LEFT JOIN developers d ON u.developer_id = d.id
      LEFT JOIN compounds c ON u.compound_id = c.id
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 0;

    if (developer_id) {
      params.push(developer_id);
      query += ` AND u.developer_id = $${++paramIndex}`;
    }

    if (compound_id) {
      params.push(compound_id);
      query += ` AND u.compound_id = $${++paramIndex}`;
    }

    if (status) {
      params.push(status);
      query += ` AND u.status = $${++paramIndex}`;
    }

    query += ` ORDER BY u.created_at DESC`;

    const result = await db.query(query, params);
    const units = result.rows;

    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(units.map(unit => ({
      'Unit Number': unit.unit_number,
      'Developer': unit.developer_name,
      'Compound': unit.compound_name,
      'Unit Type': unit.unit_type,
      'Offering Type': unit.offering_type,
      'Land Area (sqm)': unit.land_area,
      'BUA (sqm)': unit.bua,
      'Description': unit.description,
      'Price (EGP)': unit.price,
      'State': unit.state,
      'Materials': unit.materials,
      'Material Link': unit.material_link,
      'Owner Name': unit.owner_name,
      'Owner Phone': unit.owner_phone,
      'Owner Email': unit.owner_email,
      'Status': unit.status,
      'Created At': unit.created_at ? new Date(unit.created_at).toLocaleString() : ''
    })));

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Units');

    // Generate buffer
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=units_export_${Date.now()}.xlsx`);
    res.send(buffer);
  } catch (error) {
    console.error('Error exporting units to Excel:', error);
    res.status(500).json({ error: 'Failed to export units' });
  }
};

const exportUnitsToPDF = async (req, res) => {
  try {
    const { developer_id, compound_id, status } = req.query;

    let query = `
      SELECT 
        u.unit_number,
        d.name AS developer_name,
        c.name AS compound_name,
        u.unit_type,
        u.offering_type,
        u.land_area,
        u.bua,
        u.description,
        u.price,
        u.state,
        u.materials,
        u.material_link,
        u.owner_name,
        u.owner_phone,
        u.owner_email,
        u.status,
        u.created_at
      FROM units u
      LEFT JOIN developers d ON u.developer_id = d.id
      LEFT JOIN compounds c ON u.compound_id = c.id
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 0;

    if (developer_id) {
      params.push(developer_id);
      query += ` AND u.developer_id = $${++paramIndex}`;
    }

    if (compound_id) {
      params.push(compound_id);
      query += ` AND u.compound_id = $${++paramIndex}`;
    }

    if (status) {
      params.push(status);
      query += ` AND u.status = $${++paramIndex}`;
    }

    query += ` ORDER BY u.created_at DESC`;

    const result = await db.query(query, params);
    const units = result.rows;

    // Create PDF
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // Add title page
    const titlePage = pdfDoc.addPage([612, 792]);
    titlePage.drawText('Resale Management System', {
      x: 50,
      y: 700,
      size: 24,
      font: boldFont,
      color: rgb(0.1, 0.3, 0.6)
    });
    titlePage.drawText('Units Export Report', {
      x: 50,
      y: 670,
      size: 18,
      font: font,
      color: rgb(0.2, 0.2, 0.2)
    });
    titlePage.drawText(`Generated: ${new Date().toLocaleString()}`, {
      x: 50,
      y: 640,
      size: 12,
      font: font,
      color: rgb(0.4, 0.4, 0.4)
    });
    titlePage.drawText(`Total Units: ${units.length}`, {
      x: 50,
      y: 610,
      size: 14,
      font: boldFont,
      color: rgb(0.2, 0.2, 0.2)
    });

    // Add units table
    const page = pdfDoc.addPage([612, 792]);
    const margin = 50;
    const pageWidth = 612 - (margin * 2);
    const rowHeight = 20;
    const headerHeight = 30;
    let y = 750;

    // Table headers
    const headers = ['Unit #', 'Developer', 'Compound', 'Type', 'Price', 'Status'];
    const colWidths = [80, 120, 120, 80, 100, 80];

    // Draw header
    page.drawText('Units List', {
      x: margin,
      y: y,
      size: 16,
      font: boldFont,
      color: rgb(0.1, 0.3, 0.6)
    });
    y -= 30;

    let x = margin;
    headers.forEach((header, i) => {
      page.drawText(header, {
        x: x,
        y: y,
        size: 10,
        font: boldFont,
        color: rgb(0.2, 0.2, 0.2)
      });
      x += colWidths[i];
    });
    y -= headerHeight;

    // Draw rows
    for (const unit of units) {
      if (y < 50) {
        // Add new page if needed
        const newPage = pdfDoc.addPage([612, 792]);
        y = 750;
        x = margin;
        headers.forEach((header, i) => {
          newPage.drawText(header, {
            x: x,
            y: y,
            size: 10,
            font: boldFont,
            color: rgb(0.2, 0.2, 0.2)
          });
          x += colWidths[i];
        });
        y -= headerHeight;
      }

      x = margin;
      const rowData = [
        unit.unit_number || '',
        unit.developer_name || '',
        unit.compound_name || '',
        unit.unit_type || '',
        unit.price ? unit.price.toLocaleString() : '',
        unit.status || ''
      ];

      rowData.forEach((cell, i) => {
        page.drawText(String(cell).substring(0, 20), {
          x: x,
          y: y,
          size: 9,
          font: font,
          color: rgb(0.3, 0.3, 0.3)
        });
        x += colWidths[i];
      });
      y -= rowHeight;
    }

    // Generate PDF buffer
    const pdfBytes = await pdfDoc.save();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=units_export_${Date.now()}.pdf`);
    res.send(Buffer.from(pdfBytes));
  } catch (error) {
    console.error('Error exporting units to PDF:', error);
    res.status(500).json({ error: 'Failed to export units' });
  }
};

module.exports = {
  exportUnitsToCSV,
  exportUnitsToPDF
};
