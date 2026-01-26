import { Request, Response } from 'express';
import canvas from '../config/db'; // Typo in import or original file? Wait, original was `import prisma from '../config/db';`
import prisma from '../config/db';
import geoip from 'geoip-lite';

// Simple Rule Evaluator
const evaluateCondition = (condition: any, context: any): boolean => {
    switch (condition.type) {
        case 'TIME_RANGE': {
            if (!condition.startTime || !condition.endTime) return true;
            const now = new Date();
            const currentHour = now.getHours();
            const currentMinute = now.getMinutes();
            const currentTime = currentHour * 60 + currentMinute;

            const [startH, startM] = condition.startTime.split(':').map(Number);
            const startTime = startH * 60 + startM;

            const [endH, endM] = condition.endTime.split(':').map(Number);
            const endTime = endH * 60 + endM;

            const passed = currentTime >= startTime && currentTime <= endTime;
            console.log(`[Eval] Time Check: ServerTime=${currentHour}:${currentMinute} (${currentTime}) Range=${startTime}-${endTime} -> ${passed}`);
            return passed;
        }
        case 'DAYS_OF_WEEK': {
            if (!condition.days || !Array.isArray(condition.days)) return true;
            const today = new Date().getDay(); // 0 (Sun) - 6 (Sat)
            // Mapping: 0=Sun, 1=Mon... 
            // If frontend sends 1=Mon to 7=Sun, we need to adjust.
            // Let's assume frontend sends JS standards: 0=Sun, 1=Mon.
            return condition.days.includes(today);
        }
        case 'DEVICE_TYPE': {
            if (!condition.devices) return true;
            const allowedDevices = Array.isArray(condition.devices) ? condition.devices : [condition.devices];

            const userAgent = (context.userAgent || '').toLowerCase();
            const isMobile = /mobile|android|iphone|ipad|ipod/i.test(userAgent);
            const currentDevice = isMobile ? 'mobile' : 'desktop';

            console.log(`[Eval] Device Check: UserUA=${userAgent.substring(0, 20)}... Detected=${currentDevice} Allowed=${allowedDevices}`);

            // Case-insensitive check
            const passed = allowedDevices.some((d: string) => d.toLowerCase() === currentDevice);
            return passed;
        }
        case 'LOCATION': {
            if (!condition.countries || !Array.isArray(condition.countries)) return true;
            if (!context.country) {
                console.log(`[Eval] Location Check: No country found (Localhost?) -> FAIL`);
                return false;
            }
            const passed = condition.countries.includes(context.country);
            console.log(`[Eval] Location Check: User=${context.country} Allowed=${condition.countries} -> ${passed}`);
            return passed;
        }
        default:
            return true;
    }
};

// GET /api/public/:username/:slug
export const getPublicHub = async (req: Request, res: Response) => {
    try {
        const { username, slug } = req.params;

        // Fetch Hub with Rules and ALL Links (even inactive ones might be shown by rules logic? 
        // For now, let's assume we only touch Active links, OR that rules can override isActive.
        // Let's stick to: We fetch active links. Rules create *additional* restrictions or modifications.
        // ACTUALLY: A rule "Show Link X" implies X might be hidden by default. 
        // So we should fetch ALL links, but user sees only those that are (isActive AND not hidden) OR (shown by rule).
        // To simplify: We fetch ALL links. Calculate visibility based on isActive + Rules.

        // Fetch Hub with scoped username + slug
        const hub = await prisma.linkHub.findFirst({
            where: {
                slug,
                user: { username }
            },
            include: {
                user: { select: { id: true, name: true, avatar: true, username: true } },
                links: {
                    where: { deletedAt: null },
                    orderBy: { position: 'asc' }
                },
                rules: {
                    where: { isActive: true },
                    orderBy: { priority: 'desc' }
                }
            }
        });

        if (!hub || !hub.isActive) {
            return res.status(404).json({ message: 'Hub not found or inactive' });
        }

        // --- RULE EVALUATION ---
        const userAgent = req.headers['user-agent'] || '';
        const ip = (req.headers['x-forwarded-for'] as string) || req.ip || req.socket.remoteAddress || '127.0.0.1';
        // Fix for localhost/::1
        const cleanIp = (Array.isArray(ip) ? ip[0] : ip).replace(/^::ffff:/, '');
        const geo = geoip.lookup(cleanIp === '::1' ? '127.0.0.1' : cleanIp);
        const country = geo ? geo.country : null;

        const context = { userAgent, country, ip: cleanIp };
        console.log(`[PublicHub] Eval Context: IP=${cleanIp} Country=${country} UA=${userAgent.substring(0, 20)}...`);

        // 1. Start with base visibility from link.isActive
        let visibleLinks = new Set(hub.links.filter(l => l.isActive).map(l => l.id));
        const allLinkIds = new Set(hub.links.map(l => l.id));

        // 2. Apply Rules
        for (const rule of hub.rules) {
            let conditionsMet = true;
            const conditions = JSON.parse(rule.conditions);

            for (const condition of conditions) {
                const passed = evaluateCondition(condition, context);
                console.log(`[PublicHub] Rule "${rule.name}" Condition ${condition.type}: ${passed ? 'PASS' : 'FAIL'}`);
                if (!passed) {
                    conditionsMet = false;
                    break;
                }
            }

            if (conditionsMet) {
                console.log(`[PublicHub] Rule "${rule.name}" ACTIVATED`);
                const actions = JSON.parse(rule.actions);
                for (const action of actions) {
                    if (action.type === 'SHOW_LINK' && action.linkId && allLinkIds.has(action.linkId)) {
                        visibleLinks.add(action.linkId);
                        console.log(`  -> Action: SHOW Link ${action.linkId}`);
                    } else if (action.type === 'HIDE_LINK' && action.linkId) {
                        visibleLinks.delete(action.linkId);
                        console.log(`  -> Action: HIDE Link ${action.linkId}`);
                    } else if (action.type === 'REDIRECT' && action.url) {
                        console.log(`  -> Action: REDIRECT to ${action.url}`);
                        return res.json({ redirect: action.url }); // Early exit for redirect
                    }
                }
            }
        }

        // Filter links to return only visible ones
        const finalLinks = hub.links.filter(l => visibleLinks.has(l.id));

        // Async: Record visit (unchanged)
        prisma.visit.create({
            data: {
                hubId: hub.id,
                ipAddress: cleanIp,
                userAgent: userAgent,
                country: country,
                deviceType: /mobile|android|iphone|ipad|ipod/i.test(userAgent) ? 'mobile' : 'desktop'
            }
        }).catch(err => console.error('Failed to log visit', err));

        // Return hub with filtered links
        res.json({ hub: { ...hub, links: finalLinks, rules: undefined } }); // Hide rules in response
    } catch (error: any) {
        console.error('[PublicHub] Error:', error);
        res.status(500).json({ message: error.message });
    }
};
