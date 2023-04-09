
self.addEventListener('push', function (event) {
  const data = event.data.json();

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: 'https://tuleep.trade/tulip.png',
      image: 'https://tuleep.trade/tulip.png',
      vibrate: [200, 100, 200, 100, 200, 100, 200],
    })
  );
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  event.waitUntil(
    clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then(function (results) {
        const openTab = results.find(function (client) {
          return client.url === self.registration.scope && 'focus' in client;
        });

        if (openTab) {
          openTab.focus();
        } else {
          clients.openWindow(self.registration.scope);
        }
      })
  );
});

self.addEventListener('pushsubscriptionchange', function (event) {
  event.waitUntil(
    fetch('https://stemm.tuleep.trade/push/update', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        oldEndpoint: event.oldSubscription.endpoint,
        newSubscription: JSON.stringify(event.newSubscription),
      }),
    })
  );
});
