document.getElementById('analyze-btn').addEventListener('click', async () => {
  const shortUrl = document.getElementById('short-url').value;
  const resultDiv = document.getElementById('result');

  // 檢查是否有值
  if (!shortUrl) {
    resultDiv.innerHTML = '<p style="color: red;">請輸入短網址。</p>';
    return;
  }

  // 檢查是否為有效網址
  try {
    new URL(shortUrl);
  } catch (e) {
    resultDiv.innerHTML = '<p style="color: red;">請輸入有效的網址。</p>';
    return;
  }

  resultDiv.innerHTML = '<p>正在分析中，請稍候...</p>';

  try {
    const response = await fetch('http://localhost:3000/decode', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ shortUrl })
    });
    const data = await response.json();

    if (data.error) throw new Error(data.error);

    // 過濾查詢參數
    const filterParams = [
      '^utm_', '^stm_', '_gl', '_ga', 'clid', '_hs', 'hsa_', 'icid', 'igshid',
      'mc_', 'mkt_tok', 'yclid', '_openstat', 'wicked',
      'otc', 'oly_', 'rb_clickid', 'soc_', 'cvid', 'oicd', 'vgo_ee',
      'srsltid', 'gs_lcrp', 'gclid', 'gad_source', 'sxsrf', 'sca_esv'
    ];
    const urlObj = new URL(data.destinationUrl);
    filterParams.forEach(param => {
      const regex = new RegExp(param);
      [...urlObj.searchParams.keys()].forEach(key => {
        if (regex.test(key)) {
          urlObj.searchParams.delete(key);
        }
      });
    });
    const filteredUrl = urlObj.toString();

    resultDiv.innerHTML = `
      <p><strong>原始網址：</strong> <a href="${data.destinationUrl}" target="_blank" rel="noopener noreferrer">${data.destinationUrl}</a></p>
      <p><strong>過濾後網址：</strong> <a href="${filteredUrl}" target="_blank" rel="noopener noreferrer">${filteredUrl}</a></p>
      <p><strong>標題：</strong> ${data.title}</p>
      <p><strong>描述：</strong> ${data.description}</p>
    `;
  } catch (error) {
    resultDiv.innerHTML = `<p style="color: red;">發生錯誤：${error.message}</p>`;
  }
});
