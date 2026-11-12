// Native fetch is available in Node.js 18+

const ENDPOINT = 'http://localhost:3000/api/track';

const locations = [
    { ip: '8.8.8.8', country: 'US' }, // Google (US)
    { ip: '194.195.240.0', country: 'DE' }, // Hetzner (Germany)
    { ip: '202.214.194.0', country: 'JP' }, // Softbank (Japan)
    { ip: '185.199.108.153', country: 'US' }, // GitHub (US)
    { ip: '62.219.128.0', country: 'IL' } // Bezeq (Israel)
];

async function sendVisit(loc) {
    try {
        const res = await fetch(ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Forwarded-For': loc.ip,
                'User-Agent': 'TrafficSimulator/1.0'
            },
            body: JSON.stringify({
                path: ['/', '/projects', '/about'][Math.floor(Math.random() * 3)]
            })
        });

        if (res.ok) {
            process.stdout.write('.');
        } else {
            process.stdout.write('x');
            console.error(await res.text());
        }
    } catch (e) {
        console.error(e);
    }
}

async function simulate() {
    console.log(`Simulating traffic to ${ENDPOINT}...`);

    const visits = locations.flatMap((loc) => {
        // Send random number of visits
        const count = Math.floor(Math.random() * 5) + 1;
        console.log(`Sending ${count} visits from ${loc.country} (${loc.ip})...`);
        return Array.from({ length: count }, () => sendVisit(loc));
    });
    await Promise.all(visits);

    console.log("\nSimulation complete. Check Dashboard.");
}

simulate().catch(console.error);
