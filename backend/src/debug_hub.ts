
import prisma from './config/db';

async function debugHub(slug: string) {
    console.log(`Debugging Hub with slug: ${slug}`);

    const hub = await prisma.linkHub.findUnique({
        where: { slug },
        include: {
            user: true,
            links: {
                orderBy: { position: 'asc' }
            },
            rules: true
        }
    });

    if (!hub) {
        console.log('Hub not found!');
        return;
    }

    console.log(`Hub Found: ${hub.title} (ID: ${hub.id})`);
    console.log(`isActive: ${hub.isActive}`);
    console.log(`Theme: ${hub.theme}`);

    console.log(`\n--- LINKS (${hub.links.length}) ---`);
    hub.links.forEach(l => {
        console.log(`[${l.id}] ${l.title} (${l.url}) - Active: ${l.isActive}, Deleted: ${l.deletedAt}`);
    });

    console.log(`\n--- RULES (${hub.rules.length}) ---`);
    hub.rules.forEach(r => {
        console.log(`[${r.id}] ${r.name} - Active: ${r.isActive}`);
        console.log(`Conditions: ${r.conditions}`);
        console.log(`Actions: ${r.actions}`);
    });
}

// Get slug from args
const slug = process.argv[2];
if (!slug) {
    console.error('Please provide a slug');
    process.exit(1);
}

debugHub(slug).catch(console.error).finally(async () => {
    await prisma.$disconnect();
});
