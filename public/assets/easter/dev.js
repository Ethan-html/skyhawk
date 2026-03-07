// Dev.js
//Replace footer web builder with <a href="#" onclick="devpage(); return false;" style="color: #919293; text-decoration: underline;"> to use this
(() => {
  const secretSequence = "hi";
  const correctPassword = "AirForce5";
  let keysPressed = [];

  // -----------------------
  // Stage cookie helper
  // -----------------------
  const setStage = (stage) => {
    if (![1, 2, 3].includes(stage)) throw new Error("Stage must be 1, 2, or 3");
    document.cookie = `td_stage=${stage}; path=/; max-age=${60*60*24*365}`;
  };

  const getStage = () => {
    const match = document.cookie.match(/(?:^|;\s*)td_stage=(\d)/);
    return match ? parseInt(match[1], 10) : null;
  };

  // -----------------------
  // Key sequence detection
  // -----------------------
  document.addEventListener("keydown", (e) => {
    keysPressed.push(e.key.toLowerCase());
    keysPressed = keysPressed.slice(-secretSequence.length);

    if (keysPressed.join("") === secretSequence) {
      if (window.location.href.includes("/memberpage?page=page/google-form") && getStage() === 1) {
        showArrivalPopup().then((result) => {
          if (result === true) {
            setStage(2);
            showMessage(`See you then! If it's locked, the code is "${correctPassword}"`);
          } else if (result === false) {
            showMessage("I don't know if I will be there ❌");
          }
        });
      }
    }
  });

  // -----------------------
  // Popup creation
  // -----------------------
  const createPopup = () => {
    const overlay = Object.assign(document.createElement('div'), {
      style: `
        position: fixed; top:0; left:0; width:100%; height:100%;
        background: rgba(0,0,0,0.6); display:flex; align-items:center;
        justify-content:center; z-index:9999; padding:10px; box-sizing:border-box;
      `
    });

    const popup = Object.assign(document.createElement('div'), {
      style: `
        background:#fff; padding:20px; border-radius:12px; box-shadow:0 4px 20px rgba(0,0,0,0.25);
        text-align:center; width:100%; max-width:320px; font-family:Arial,sans-serif; position:relative;
      `
    });

    const closeBtn = Object.assign(document.createElement('span'), {
      textContent: '×',
      style: `
        position:absolute; top:8px; right:12px; font-size:22px; font-weight:bold;
        cursor:pointer;
      `,
      onclick: () => document.body.removeChild(overlay)
    });

    popup.appendChild(closeBtn);
    overlay.appendChild(popup);
    document.body.appendChild(overlay);

    return { overlay, popup };
  };

  // -----------------------
  // Arrival popup
  // -----------------------
  const showArrivalPopup = () => new Promise((resolve) => {
    const { overlay, popup } = createPopup();
    popup.onclick = e => e.stopPropagation();

    const question = Object.assign(document.createElement('p'), {
      textContent: 'What time will you be arriving this Monday?',
      style: 'font-size:16px; margin-bottom:15px; color:#333'
    });
    popup.appendChild(question);

    const timeInput = Object.assign(document.createElement('input'), {
      type: 'time',
      style: `
        font-size:16px; padding:10px; width:100%; box-sizing:border-box;
        margin-bottom:20px; border-radius:8px; border:1px solid #ccc; text-align:center;
      `
    });
    popup.appendChild(timeInput);

    const submitBtn = Object.assign(document.createElement('button'), {
      textContent: 'Submit',
      style: `
        padding:12px 20px; font-size:16px; cursor:pointer;
        border:none; border-radius:8px; background:#007BFF; color:#fff; width:100%; box-sizing:border-box;
      `,
      onclick: () => {
        const val = timeInput.value;
        document.body.removeChild(overlay);
        if (!val) resolve(null);
        else if (val === '19:00') resolve(true);
        else resolve(false);
      }
    });
    popup.appendChild(submitBtn);

    overlay.onclick = () => {
      document.body.removeChild(overlay);
      resolve(null);
    };
  });

  // -----------------------
  // Message popup
  // -----------------------
  const showMessage = (msgText) => {
    const { overlay, popup } = createPopup();
    popup.onclick = e => e.stopPropagation();

    const msg = Object.assign(document.createElement('p'), {
      textContent: msgText,
      style: 'font-size:16px; color:#333; margin:20px 0;'
    });
    popup.appendChild(msg);
  };

  // -----------------------
  // Developer page
  // -----------------------
  window.devpage = () => {
    let stage = getStage() ?? 0;

    if (stage === 3) return window.location.href = "https://techduck.com/codered";
    if (stage === 0) setStage(1), stage = 1;

    const { overlay, popup } = createPopup();
    popup.onclick = e => e.stopPropagation();

    const header = Object.assign(document.createElement('h2'), {
      textContent: "Enter Password",
      style: 'font-size:18px; margin-bottom:10px; color:#333'
    });
    popup.appendChild(header);

    const hint = Object.assign(document.createElement('p'), {
      textContent: "If you don't know the password, come let us know if you're coming and say hi",
      style: 'font-size:14px; color:#555; margin-bottom:12px'
    });
    popup.appendChild(hint);

    const form = document.createElement('form');
    form.onsubmit = e => e.preventDefault();
    popup.appendChild(form);

    const passwordInput = Object.assign(document.createElement('input'), {
      type: 'password',
      placeholder: 'Enter password',
      style: `
        font-size:16px; padding:10px; width:100%; box-sizing:border-box;
        margin-bottom:20px; border-radius:8px; border:1px solid #ccc;
      `
    });
    form.appendChild(passwordInput);

    const submitBtn = Object.assign(document.createElement('button'), {
      type: 'submit',
      textContent: 'Submit',
      style: `
        padding:12px 20px; font-size:16px; cursor:pointer;
        border:none; border-radius:8px; background:#28a745; color:#fff;
        width:100%; box-sizing:border-box;
      `,
      onclick: () => {
        if (passwordInput.value.trim() === correctPassword) {
          setStage(3);
          window.location.href = "https://techduck.com/codered";
        } else alert("Incorrect password ❌");
      }
    });
    form.appendChild(submitBtn);
    const note = Object.assign(document.createElement('p'), {
      textContent: "EasterEgg",
      style: 'font-size:14px; color:#555; margin-bottom:12px'
    });
    popup.appendChild(note);

    overlay.onclick = () => document.body.removeChild(overlay);
  };
})();
