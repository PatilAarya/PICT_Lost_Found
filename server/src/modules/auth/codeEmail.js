// Builds the login code email.
const INK = '#1d3557';
const PAPER = '#f1faee';
const FROST = '#a8dadc';
const BERRY = '#e63946';

export function spacedCode(code) {
  return `${code.slice(0, 3)} ${code.slice(3)}`;
}

function codeHtml(code, minutes) {
  return `<!doctype html>
<html><body style="margin:0;padding:24px;background:${PAPER};font-family:Arial,sans-serif;color:${INK}">
  <table role="presentation" cellpadding="0" cellspacing="0" style="max-width:420px;width:100%;border:2px solid ${INK};border-left:8px solid ${BERRY};background:${PAPER}">
    <tr>
      <td style="padding:20px">
        <p style="margin:0 0 4px;font-size:15px">PICT Lost and Found</p>
        <p style="margin:0 0 16px;font-size:21px;font-weight:bold">Your login code</p>
        <p style="margin:0;font-size:38px;font-weight:bold;letter-spacing:6px">${spacedCode(code)}</p>
        <p style="margin:16px 0 0;font-size:15px">It works for ${minutes} minutes. If you did not ask for it, ignore this email.</p>
      </td>
      <td style="width:64px;border-left:2px dashed ${FROST};text-align:center;font-size:13px;font-weight:bold">PICT</td>
    </tr>
  </table>
</body></html>`;
}

export function buildCodeEmail(code, minutes) {
  return {
    subject: `Your PICT Lost and Found code: ${code}`,
    text: `Your login code is ${code}. It works for ${minutes} minutes. If you did not ask for it, ignore this email.`,
    html: codeHtml(code, minutes),
  };
}
