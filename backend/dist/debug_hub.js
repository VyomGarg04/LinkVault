"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = __importDefault(require("./config/db"));
function debugHub(slug) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(`Debugging Hub with slug: ${slug}`);
        const hub = yield db_1.default.linkHub.findUnique({
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
    });
}
// Get slug from args
const slug = process.argv[2];
if (!slug) {
    console.error('Please provide a slug');
    process.exit(1);
}
debugHub(slug).catch(console.error).finally(() => __awaiter(void 0, void 0, void 0, function* () {
    yield db_1.default.$disconnect();
}));
//# sourceMappingURL=debug_hub.js.map