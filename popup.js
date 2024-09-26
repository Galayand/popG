document.getElementById('check-mail').addEventListener('click', function() {
    chrome.runtime.sendMessage({ action: 'checkEmail' });
  });
  