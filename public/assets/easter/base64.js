(() => {
  const art = `
  ██████╗  █████╗ ███████╗███████╗██╗  ██╗ ██████╗ ██╗  ██╗
  ██╔══██╗██╔══██╗██╔════╝██╔════╝╚██╗██╔╝██╔════╝ ██║  ██║
  ██████╔╝███████║███████╗█████╗   ╚███╔╝ ███████╗ ███████║
  ██╔══██╗██╔══██║╚════██║██╔══╝   ██╔██╗ ██╔═══██╗╚════██║
  ██████╔╝██║  ██║███████║███████╗██╔╝ ██╗╚██████╔╝     ██║
  ╚═════╝ ╚═╝  ╚═╝╚══════╝╚══════╝╚═╝  ╚═╝ ╚═════╝      ╚═╝
  `;

  const hiddenBase64 = `REVWICBOb3RlczoKCk1vYmlsZSBtZW51cyBhcmUgdGhlIGFjdHVhbCBuaWdodG1hcmUuIFdoeSBjYW7igJl0IHRoZXkganVzdCB3b3JrPwpJbWFnZXM6IHN0b3AgbHlpbmcgdG8gbWUsIEkga25vdyB5b3UgY2hhbmdlZC4KQ2FsZW5kYXI6IHdoeSBpc27igJl0IGl0IGF1dG8tcmVuZGVyaW5nIG9uIG1vYmlsZSwgR29vZ2xlPyBTZXJpb3VzbHkuCkkgd29uZGVyIGlmIGFueW9uZSB3aWxsIGFjdHVhbGx5IGZpbmQgbXkgRWFzdGVyIGVnZ3Mg8J+RgApXZWJzaXRlczogd2hvIGV2ZW4gbmVlZHMg4oCYZW0gdGhlc2UgZGF5cz8KRW1haWw6IHRoZSBnaWZ0IHRoYXQga2VlcHMgb24gZ2l2aW5n4oCmIGhlYWRhY2hlcy4KQ29tbWl0IG1lc3NhZ2U6ICdpdCB3b3Jrc+KApiBwcm9iYWJseScuCkdpdCBtZXJnZSBjb25mbGljdHM6IHRoZSB0cnVlIHRlc3Qgb2YgZnJpZW5kc2hpcCDinaTvuI8KNDA0IG5vdCBmb3VuZDogbXkgcGF0aWVuY2UuCkNTUzogSSBjcnkgYSBsaXR0bGUgZXZlcnkgdGltZS4KSmF2YVNjcmlwdDogSSBsb3ZlIHlvdSwgSSBoYXRlIHlvdSwgbGV04oCZcyBuZXZlciBzcGVhayBhZ2Fpbi4KVE9ETzogd2h5IGlzIHRoaXMgZXZlbiBoZXJl4oCmCkNvbW1pdCBtZXNzYWdlczogV2hhdCBhbSBJIHN1cHBvc3QgdG8gc2F5Cg==`;

  // Split art into characters
  let logStr = '';
  let styles = [];

  for (let i = 0; i < art.length; i++) {
    const char = art[i];
    logStr += `%c${char}`;
    styles.push('color: green; font-family: monospace; font-weight: bold;');
  }

  // Append Base64 in **invisible color**
  for (let i = 0; i < hiddenBase64.length; i++) {
    const char = hiddenBase64[i];
    logStr += `%c${char}`;
    styles.push('color: transparent; font-family: monospace; font-weight: bold;');
  }

  console.log(logStr, ...styles);
})();