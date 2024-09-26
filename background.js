// Periodically checks for new email
chrome.alarms.create('checkEmail', { periodInMinutes: 1 });

// OAuth Authentication and checking for new emails
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === 'checkEmail') {
    // Authenticate and get the access token
    chrome.identity.getAuthToken({ interactive: true }, function(token) {
      if (chrome.runtime.lastError || !token) {
        console.error(chrome.runtime.lastError);
        return;
      }
      
      fetchEmails(token);
    });
  }
});

// Function to fetch emails from Gmail API
function fetchEmails(token) {
  const API_URL = 'https://www.googleapis.com/gmail/v1/users/me/messages?labelIds=INBOX&maxResults=1&q=is:unread';
  
  fetch(API_URL, {
    method: 'GET',
    headers: {
      'Authorization': 'Bearer ' + token,
      'Content-Type': 'application/json'
    }
  }).then(response => response.json())
    .then(data => {
      if (data.messages && data.messages.length > 0) {
        const messageId = data.messages[0].id;
        getMessageContent(token, messageId);
      }
    }).catch(error => {
      console.error('Error fetching emails:', error);
    });
}

// Get the full message content
function getMessageContent(token, messageId) {
  const API_URL = `https://www.googleapis.com/gmail/v1/users/me/messages/${messageId}`;
  
  fetch(API_URL, {
    method: 'GET',
    headers: {
      'Authorization': 'Bearer ' + token,
      'Content-Type': 'application/json'
    }
  }).then(response => response.json())
    .then(data => {
      const subject = data.payload.headers.find(header => header.name === 'Subject').value;
      const from = data.payload.headers.find(header => header.name === 'From').value;

      showNotification(subject, from);
    }).catch(error => {
      console.error('Error getting email content:', error);
    });
}

// Show desktop notification
function showNotification(subject, from) {
  chrome.notifications.create('', {
    title: 'New Email Received',
    message: `From: ${from}\nSubject: ${subject}`,
    iconUrl: 'icon128.png',
    type: 'basic'
  });
}
