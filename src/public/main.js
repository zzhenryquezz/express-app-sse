

const subscriptions = [
    'connection',
    'first-event'
];

const allEvents = [];

let emitter = null;

function setReceiveEvents (eventName) {
    const receivedEvents = allEvents.filter(e => e.event === eventName);
    const list = document.getElementById('received-list');
    const subscriptionItems = document.getElementsByClassName('subscription-list-item');
    
    for (let i = 0;i < subscriptionItems.length; i++) {
        const item = subscriptionItems[i];
        
        if (item) {
            item.classList.remove('text-purple-500');
            if (item.id === `subscription-${eventName}`) {
                item.classList.add('text-purple-500');
            }
        }


    }

    list.innerHTML = '';
    receivedEvents.forEach((event, index) => {
        const item = document.createElement("li");
        const title = document.createElement("span");
        const time = document.createElement("span");
        const payload = document.createElement("code");
        
        item.className = 'py-3 pl-2 text-gray-700 cursor-pointer';
        
        if (index + 1 < receivedEvents.length) {
            item.classList.add('border-b');
        }
        
        title.innerHTML = event.event;
        title.className = 'font-bold text-gray-500 block';

        time.innerHTML = event.timestamp;
        time.className = 'text-sm text-gray-500';
        
        payload.innerHTML = JSON.stringify(event.payload);
        payload.className = 'text-sm text-white bg-gray-800 block p-2 mt-3 rounded';

        item.appendChild(title)
        item.appendChild(time)
        item.appendChild(payload)

        list.appendChild(item);
    })
}

function setEventSubscriptionList () {
    const list = document.getElementById('subscription-list');
    list.innerHTML = '';
    subscriptions.forEach((eventName, index) => {
        const item = document.createElement("li");
        const link = document.createElement("a");
        item.className = 'py-3 pl-2 text-gray-700 cursor-pointer subscription-list-item';
        item.id = `subscription-${eventName}`;

        if (index + 1 < subscriptions.length) {
            item.classList.add('border-b');
        }

        item.addEventListener('click', () => setReceiveEvents(eventName))
        item.innerHTML = eventName;
        list.appendChild(item);
    });
}

async function emitEvent() {
    const eventName = document.getElementById('emit-event-name').value;
    const payload = document.getElementById('emit-event-payload').value;
    if (!eventName) {
        return alert('Type a event name');
    }
    const request = await fetch('/emit', {
        method: 'post',
        url: '/emit',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            payload,
            event: eventName
        })
    });
}

function addSubscription() {
    const eventName = document.getElementById('subscription-event-name').value;
    if (!eventName) {
        return alert('Type a event name');
    }

    subscriptions.push(eventName);
    
    setEmitter();
}

function setEmitter() {
    
    if (emitter) {
        emitter.close()
        emitter = null;
    }

    const query = encodeURIComponent(JSON.stringify(subscriptions));
    emitter = new EventSource(`/webhook?events=${query}`);
    emitter.onmessage = (message) => {
        const data = JSON.parse(message.data);
        
        allEvents.push(data);

        setEventSubscriptionList();

        setReceiveEvents(data.event);
    }
}

function start() {
    document.getElementById('emit-event-button')
        .addEventListener('click', emitEvent);
    
    document.getElementById('subscription-event-button')
        .addEventListener('click', addSubscription);
    
    setEmitter();
}


start();
