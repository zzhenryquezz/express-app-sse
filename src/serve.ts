import express, { Response } from "express";
import path from 'path';

const app = express();

const events = {
    'connection': [],
    'close': []
};

interface Clients {
    id: number;
    res: Response
    listen: string[];
}

const clients: Clients[] = [];

function sendEventsToAll(event: string, payload: any = {}) {
    clients.forEach(c => {
        if (c.listen.includes(event)) {
            c.res.write(`data: ${JSON.stringify({
                event,
                payload: payload,
                timestamp: new Date().toLocaleString(),
            })}\n\n`);
        }
    });
}


app.use(express.json());

app.post('/emit', (req, res) => {
    
    if (!req.body.event) {
        return res.json({
            status: 500,
            success: false,
        });
    }
    
    sendEventsToAll(req.body.event, req.body.payload);

    console.log('event: event emitted', req.body.event);

    return res.json({
        status: 200,
        success: true
    })
});

app.use('/', express.static(path.resolve(__dirname, 'public')));

app.get('/webhook', (req, res) => {
    const listen = req.query.events as string[] || [];

    const headers = {
        'Content-Type': 'text/event-stream',
        'Connection': 'keep-alive',
        'Cache-Control': 'no-cache'
    };
    
    res.writeHead(200, headers);

    const clientId = Date.now();

    clients.push({
        id: clientId,
        res,
        listen: listen
    });

    sendEventsToAll('connection', { clientId });

    console.log(`connection: client connected ${clientId}`);

    // If client closes connection, stop sending events
    res.on('close', () => {
        const index = clients.findIndex(c => c.id === clientId);
        clients.splice(index, 1);
        console.log(`connection: client ${clientId} close connection`);
        res.end();
    });
    // res.send('Hello word');
})


app.listen(3000, () => {
    console.log('info: serve running on http://localhost:3000');
})