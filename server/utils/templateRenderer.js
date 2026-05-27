const { getLabel } = require('./labelMapper');

/**
 * Renders a generic HTML table for a given payload using a neutral enterprise style.
 * 
 * @param {string} eventLabel - The readable label of the event (e.g. 'Tạo đơn nghỉ phép')
 * @param {Object} payload - The JSON payload to render
 * @returns {string} The HTML string
 */
function renderGenericTable(eventLabel, payload, bodyTemplate) {
  let rowsHtml = '';
  let isZebra = false;

  let prefaceHtml = '';
  if (bodyTemplate) {
    let customBody = bodyTemplate;
    for (const [key, value] of Object.entries(payload)) {
      if (typeof value !== 'object' && value !== null && value !== undefined) {
        const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
        customBody = customBody.replace(regex, value);
      }
    }
    // Convert newlines to <br> for HTML rendering
    customBody = customBody.replace(/\\n/g, '<br/>');
    prefaceHtml = `<div style="color: #475569; font-size: 14px; margin-bottom: 20px; line-height: 1.6;">${customBody}</div>`;
  }

  for (const [key, value] of Object.entries(payload)) {
    // Skip complex objects/arrays or render them differently if needed
    if (typeof value === 'object' && value !== null) {
      continue;
    }

    const label = getLabel(key);
    const displayValue = value === null || value === undefined ? '-' : value;
    const bgClass = isZebra ? 'background-color: #f8fafc;' : 'background-color: #ffffff;';
    
    rowsHtml += `
      <tr style="${bgClass}">
        <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; color: #475569; font-weight: 500; width: 35%;">${label}</td>
        <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; color: #0f172a;">${displayValue}</td>
      </tr>
    `;
    isZebra = !isZebra;
  }

  return `
    <div style="font-family: 'Inter', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #0f172a; font-size: 18px; margin-bottom: 16px; border-bottom: 2px solid #3b82f6; padding-bottom: 8px; display: inline-block;">
        ${eventLabel}
      </h2>
      
      ${prefaceHtml}
      
      <div style="border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; margin-bottom: 24px;">
        <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 14px;">
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

/**
 * Main render function. Currently defaults to generic table.
 * Later can be extended to support specific templates (e.g. invoice, booking).
 */
function render(eventCode, eventLabel, payload, bodyTemplate) {
  // Support for specific overrides can be added here in the future
  return renderGenericTable(eventLabel, payload, bodyTemplate);
}

module.exports = {
  render
};
