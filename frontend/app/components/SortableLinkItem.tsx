import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Edit2, Trash2, ExternalLink } from 'lucide-react';
import { getFaviconUrl } from '@/lib/utils';
import { LinkItem } from '@/types'; // Need to export LinkItem or define it here

export function SortableLinkItem({
    link,
    onToggleActive,
    onEditLink,
    onDeleteLink
}: {
    link: any,
    onToggleActive: (link: any) => void,
    onEditLink: (link: any) => void,
    onDeleteLink: (id: string) => void
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: link.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 1000 : 1,
    };

    const linkStyle = link.style ? JSON.parse(link.style) : {};
    const customClass = linkStyle.highlight ? 'ring-2 ring-green-500 bg-green-900/20' : '';

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`group flex items-center p-4 bg-slate-900/40 border border-slate-800 rounded-xl hover:border-slate-700 transition-all ${isDragging ? 'shadow-xl ring-2 ring-indigo-500 bg-slate-800' : customClass}`}
        >
            <div
                {...attributes}
                {...listeners}
                className="mr-4 text-slate-600 cursor-grab active:cursor-grabbing hover:text-slate-400 p-1"
            >
                <GripVertical className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0 flex items-center">
                {getFaviconUrl(link.url) && (
                    <img src={getFaviconUrl(link.url)!} alt="" className="w-5 h-5 mr-3 object-contain rounded-sm" />
                )}
                <div className="min-w-0">
                    <h4 className="font-medium text-slate-200 truncate" style={{ color: linkStyle.highlight ? linkStyle.textColor : undefined }}>{link.title}</h4>
                    <p className="text-xs text-slate-500 truncate">{link.url}</p>
                </div>
            </div>
            <div className="flex items-center space-x-2 ml-4">
                <button
                    onClick={() => onToggleActive(link)}
                    className={`w-10 h-6 rounded-full relative transition-colors ${link.isActive ? 'bg-green-600' : 'bg-slate-700'}`}
                >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${link.isActive ? 'left-5' : 'left-1'}`} />
                </button>
                <button
                    onClick={() => onEditLink(link)}
                    className="p-2 text-slate-500 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                >
                    <Edit2 className="w-4 h-4" />
                </button>
                <button
                    onClick={() => onDeleteLink(link.id)}
                    className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
