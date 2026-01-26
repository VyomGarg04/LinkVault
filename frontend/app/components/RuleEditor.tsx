import { useState, useEffect } from "react";
import { LinkHub } from "@/types";
import api from "@/lib/api";
import { Plus, Trash2, Save, X, Clock, Calendar, Smartphone, Edit2, Globe, Check } from "lucide-react";
import { toast } from "react-hot-toast";
import TimePicker from "./TimePicker";

const COUNTRIES = [
    { code: 'US', name: 'United States' },
    { code: 'GB', name: 'United Kingdom' },
    { code: 'CA', name: 'Canada' },
    { code: 'AU', name: 'Australia' },
    { code: 'IN', name: 'India' },
    { code: 'DE', name: 'Germany' },
    { code: 'FR', name: 'France' },
    { code: 'JP', name: 'Japan' },
    { code: 'BR', name: 'Brazil' },
    // Add more as needed
];

interface Rule {
    id: string;
    name: string;
    priority: number;
    isActive: boolean;
    conditions: any[];
    actions: any[];
}

interface RuleEditorProps {
    hubId: string;
    links: any[]; // LinkItem[]
    onRulesChange?: (rules: Rule[]) => void;
    onDraftChange?: (rule: Partial<Rule> | null) => void;
}

export default function RuleEditor({ hubId, links, onRulesChange, onDraftChange }: RuleEditorProps) {
    const [rules, setRules] = useState<Rule[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [viewingRule, setViewingRule] = useState<Rule | null>(null); // Details View
    const [editingRuleId, setEditingRuleId] = useState<string | null>(null); // Edit Mode

    // New Rule State
    const [newRule, setNewRule] = useState<Partial<Rule>>({
        name: "",
        priority: 0,
        conditions: [],
        actions: [],
    });

    // Notify parent of draft changes
    useEffect(() => {
        if (isCreating) {
            // Include existing ID if editing
            const draft = editingRuleId ? { ...newRule, id: editingRuleId } : newRule;
            onDraftChange?.(draft);
        } else {
            onDraftChange?.(null);
        }
    }, [newRule, isCreating, editingRuleId]);

    useEffect(() => {
        fetchRules();
    }, [hubId]);

    const fetchRules = async () => {
        try {
            const { data } = await api.get(`/hubs/${hubId}/rules`);
            setRules(data.rules);
            onRulesChange?.(data.rules);
        } catch (error) {
            console.error("Failed to fetch rules", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveRule = async () => {
        if (!newRule.name) return toast.error("Name is required");
        try {
            if (editingRuleId) {
                const { data } = await api.put(`/hubs/${hubId}/rules/${editingRuleId}`, newRule);
                const updatedRules = rules.map(r => r.id === editingRuleId ? data.rule : r);
                setRules(updatedRules);
                onRulesChange?.(updatedRules);
                toast.success("Rule updated");
            } else {
                const { data } = await api.post(`/hubs/${hubId}/rules`, newRule);
                const updatedRules = [data.rule, ...rules];
                setRules(updatedRules);
                onRulesChange?.(updatedRules);
                toast.success("Rule created");
            }
            closeEditor();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to save rule");
        }
    };

    const handleEditClick = (rule: Rule) => {
        setViewingRule(null);
        setEditingRuleId(rule.id);
        setNewRule({
            name: rule.name,
            priority: rule.priority,
            conditions: rule.conditions,
            actions: rule.actions,
            isActive: rule.isActive
        });
        setIsCreating(true);
    };

    const closeEditor = () => {
        setIsCreating(false);
        setEditingRuleId(null);
        setNewRule({ name: "", priority: 0, conditions: [], actions: [] });
    };

    const handleDeleteRule = async (ruleId: string) => {
        if (!confirm("Delete this rule?")) return;
        try {
            await api.delete(`/hubs/${hubId}/rules/${ruleId}`);
            const updatedRules = rules.filter(r => r.id !== ruleId);
            setRules(updatedRules);
            onRulesChange?.(updatedRules);
            if (viewingRule?.id === ruleId) setViewingRule(null);
            toast.success("Rule deleted");
        } catch (error) {
            toast.error("Failed to delete rule");
        }
    };

    const addCondition = (type: string) => {
        const condition = { type };
        if (type === 'TIME_RANGE') { Object.assign(condition, { startTime: "09:00", endTime: "17:00" }); }
        if (type === 'DEVICE_TYPE') { Object.assign(condition, { devices: ["mobile"] }); }
        if (type === 'LOCATION') { Object.assign(condition, { countries: ["US"] }); }

        setNewRule({ ...newRule, conditions: [...(newRule.conditions || []), condition] });
    };

    const addAction = (type: string) => {
        const action = { type };
        if (type === 'SHOW_LINK' || type === 'HIDE_LINK') {
            if (links.length > 0) Object.assign(action, { linkId: links[0].id });
        }
        setNewRule({ ...newRule, actions: [...(newRule.actions || []), action] });
    };

    return (
        <div className="space-y-6 relative">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-slate-200">Rules Logic</h2>
                {!isCreating && (
                    <button
                        onClick={() => setIsCreating(true)}
                        className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        <span>New Rule</span>
                    </button>
                )}
            </div>

            {/* Rule Details Modal/Panel */}
            {viewingRule && !isCreating && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-lg w-full shadow-2xl animate-in fade-in zoom-in-50 relative">
                        <button
                            onClick={() => setViewingRule(null)}
                            className="absolute top-4 right-4 text-slate-400 hover:text-white"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        <h3 className="text-2xl font-bold text-white mb-2">{viewingRule.name}</h3>
                        <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border mb-6 ${viewingRule.isActive ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'}`}>
                            {viewingRule.isActive ? 'Active' : 'Inactive'}
                        </div>

                        <div className="space-y-6">
                            <div>
                                <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Conditions</h4>
                                <div className="space-y-2">
                                    {viewingRule.conditions.length === 0 && <p className="text-slate-500 text-sm">No conditions (Always runs if active)</p>}
                                    {viewingRule.conditions.map((c, i) => (
                                        <div key={i} className="bg-slate-800 p-3 rounded-lg border border-slate-700 flex flex-col text-sm">
                                            <span className="font-mono text-indigo-300 font-bold mb-1">{c.type}</span>
                                            {c.type === 'TIME_RANGE' && <span className="text-slate-300">Between {c.startTime} and {c.endTime}</span>}
                                            {c.type === 'DEVICE_TYPE' && <span className="text-slate-300">Devices: {c.devices?.join(', ')}</span>}
                                            {c.type === 'LOCATION' && <span className="text-slate-300">Locations: {c.countries?.join(', ')}</span>}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Actions</h4>
                                <div className="space-y-2">
                                    {viewingRule.actions.map((a, i) => {
                                        const targetLink = links.find(l => l.id === a.linkId);
                                        return (
                                            <div key={i} className="bg-slate-800 p-3 rounded-lg border border-slate-700 flex flex-col text-sm">
                                                <span className="font-mono text-green-300 font-bold mb-1">{a.type}</span>
                                                <span className="text-slate-300">Link: {targetLink ? targetLink.title : 'Unknown Link'}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 pt-4 border-t border-slate-800 flex justify-end">
                            <button
                                onClick={() => handleEditClick(viewingRule)}
                                className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-lg font-medium flex items-center space-x-2"
                            >
                                <Edit2 className="w-4 h-4" />
                                <span>Edit Rule</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {isCreating && (
                <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 space-y-6 animate-in fade-in slide-in-from-top-4 shadow-xl">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="font-bold text-xl text-white">{editingRuleId ? 'Edit Rule' : 'Create New Rule'}</h3>
                            <p className="text-slate-400 text-sm mt-1">Define automated behaviors for your Link Hub.</p>
                        </div>
                        <button onClick={closeEditor} className="p-2 hover:bg-slate-800 rounded-lg transition-colors"><X className="w-5 h-5 text-slate-500 hover:text-white" /></button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Rule Name</label>
                            <input
                                value={newRule.name}
                                onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
                                placeholder="e.g. Work Hours Mode"
                                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all placeholder:text-slate-600"
                            />
                        </div>

                        <div className="flex items-end pb-2">
                            <label className="flex items-center space-x-3 cursor-pointer group">
                                <div className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 ease-in-out ${newRule.isActive ? 'bg-indigo-600' : 'bg-slate-700'}`}>
                                    <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${newRule.isActive ? 'translate-x-6' : 'translate-x-0'}`} />
                                </div>
                                <input
                                    type="checkbox"
                                    checked={newRule.isActive ?? true}
                                    onChange={(e) => setNewRule({ ...newRule, isActive: e.target.checked })}
                                    className="hidden"
                                />
                                <span className={`text-sm font-medium transition-colors ${newRule.isActive ? 'text-white' : 'text-slate-400'}`}>
                                    {newRule.isActive ? 'Rule is Active' : 'Rule is Inactive'}
                                </span>
                            </label>
                        </div>
                    </div>

                    <div className="border-t border-slate-800 pt-6">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h4 className="text-sm font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                                    Conditions
                                </h4>
                                <p className="text-xs text-slate-500 mt-1">All conditions must be met for this rule to run.</p>
                            </div>
                            <div className="flex space-x-2">
                                <button onClick={() => addCondition('TIME_RANGE')} className="px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg border border-slate-700 transition-colors flex items-center gap-1.5">
                                    <Clock className="w-3.5 h-3.5" /> <span>Time</span>
                                </button>
                                <button onClick={() => addCondition('DEVICE_TYPE')} className="px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg border border-slate-700 transition-colors flex items-center gap-1.5">
                                    <Smartphone className="w-3.5 h-3.5" /> <span>Device</span>
                                </button>
                                <button onClick={() => addCondition('LOCATION')} className="px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg border border-slate-700 transition-colors flex items-center gap-1.5">
                                    <Globe className="w-3.5 h-3.5" /> <span>Location</span>
                                </button>
                            </div>
                        </div>

                        <div className="space-y-3">
                            {newRule.conditions?.length === 0 && (
                                <div className="text-center py-8 border-2 border-dashed border-slate-800 rounded-xl bg-slate-900/50">
                                    <p className="text-slate-500 text-sm">No conditions set. This rule will always apply.</p>
                                </div>
                            )}
                            {newRule.conditions?.map((cond, idx) => (
                                <div key={idx} className="flex items-center gap-4 bg-slate-950 p-4 rounded-xl border border-slate-800 hover:border-slate-700 transition-all group">
                                    <div className={`px-3 py-1.5 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold font-mono tracking-wide uppercase whitespace-nowrap ${cond.type === 'TIME_RANGE' ? 'mt-5' : ''}`}>
                                        {cond.type.replace('_', ' ')}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        {cond.type === 'TIME_RANGE' && (
                                            <div className="flex items-center gap-3">
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-[10px] uppercase text-slate-500 font-bold ml-1">Start</span>
                                                    <TimePicker
                                                        value={cond.startTime}
                                                        onChange={(val) => {
                                                            const newConds = [...newRule.conditions!];
                                                            newConds[idx].startTime = val;
                                                            setNewRule({ ...newRule, conditions: newConds });
                                                        }}
                                                    />
                                                </div>
                                                <span className="text-slate-600 text-sm mt-4">to</span>
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-[10px] uppercase text-slate-500 font-bold ml-1">End</span>
                                                    <TimePicker
                                                        value={cond.endTime}
                                                        onChange={(val) => {
                                                            const newConds = [...newRule.conditions!];
                                                            newConds[idx].endTime = val;
                                                            setNewRule({ ...newRule, conditions: newConds });
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {cond.type === 'DEVICE_TYPE' && (
                                            <div className="flex items-center gap-4">
                                                {['mobile', 'desktop'].map(device => (
                                                    <label key={device} className="flex items-center gap-2 cursor-pointer group/item">
                                                        <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${cond.devices?.includes(device) ? 'bg-indigo-600 border-indigo-600' : 'bg-slate-900 border-slate-600 group-hover/item:border-slate-500'}`}>
                                                            {cond.devices?.includes(device) && <Check className="w-3 h-3 text-white" />}
                                                        </div>
                                                        <input
                                                            type="checkbox"
                                                            checked={cond.devices?.includes(device)}
                                                            onChange={(e) => {
                                                                const newConds = [...newRule.conditions!];
                                                                const current = newConds[idx].devices || [];
                                                                if (e.target.checked) {
                                                                    newConds[idx].devices = [...current, device];
                                                                } else {
                                                                    newConds[idx].devices = current.filter((d: string) => d !== device);
                                                                }
                                                                setNewRule({ ...newRule, conditions: newConds });
                                                            }}
                                                            className="hidden"
                                                        />
                                                        <span className="capitalize text-slate-300 text-sm">{device}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        )}

                                        {cond.type === 'LOCATION' && (
                                            <select
                                                value={cond.countries?.[0] || 'US'}
                                                onChange={(e) => {
                                                    const newConds = [...newRule.conditions!];
                                                    newConds[idx].countries = [e.target.value];
                                                    setNewRule({ ...newRule, conditions: newConds });
                                                }}
                                                className="bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-3 py-1.5 text-sm focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                                            >
                                                {COUNTRIES.map(c => (
                                                    <option key={c.code} value={c.code}>{c.name}</option>
                                                ))}
                                            </select>
                                        )}
                                    </div>

                                    <button onClick={() => {
                                        const newConds = newRule.conditions!.filter((_, i) => i !== idx);
                                        setNewRule({ ...newRule, conditions: newConds });
                                    }} className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="border-t border-slate-800 pt-6">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h4 className="text-sm font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                    Actions
                                </h4>
                                <p className="text-xs text-slate-500 mt-1">What should happen when conditions are met.</p>
                            </div>
                            <button onClick={() => addAction('SHOW_LINK')} className="px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg border border-slate-700 transition-colors">
                                + Add Action
                            </button>
                        </div>

                        <div className="space-y-3">
                            {newRule.actions?.length === 0 && (
                                <div className="text-center py-6 border-2 border-dashed border-slate-800 rounded-xl bg-slate-900/50">
                                    <p className="text-slate-500 text-sm">No actions defined.</p>
                                </div>
                            )}
                            {newRule.actions?.map((action, idx) => (
                                <div key={idx} className="flex items-center gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800 hover:border-slate-700 transition-all group">
                                    <div className="relative">
                                        <select
                                            value={action.type}
                                            onChange={(e) => {
                                                const newActions = [...newRule.actions!];
                                                newActions[idx].type = e.target.value;
                                                setNewRule({ ...newRule, actions: newActions });
                                            }}
                                            className="appearance-none bg-slate-900 border border-slate-700 rounded-lg pl-3 pr-8 py-2 text-xs font-bold text-slate-300 uppercase tracking-wide focus:border-indigo-500 outline-none cursor-pointer hover:bg-slate-800 transition-colors"
                                        >
                                            <option value="SHOW_LINK">Show Link</option>
                                            <option value="HIDE_LINK">Hide Link</option>
                                        </select>
                                    </div>

                                    <span className="text-slate-600 text-xs font-bold uppercase">Target</span>

                                    <div className="flex-1">
                                        <select
                                            value={action.linkId}
                                            onChange={(e) => {
                                                const newActions = [...newRule.actions!];
                                                newActions[idx].linkId = e.target.value;
                                                setNewRule({ ...newRule, actions: newActions });
                                            }}
                                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none hover:bg-slate-800 transition-colors cursor-pointer"
                                        >
                                            {links.map(l => (
                                                <option key={l.id} value={l.id}>{l.title}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <button onClick={() => {
                                        const newActions = newRule.actions!.filter((_, i) => i !== idx);
                                        setNewRule({ ...newRule, actions: newActions });
                                    }} className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end pt-6 border-t border-slate-800">
                        <div className="flex gap-3">
                            <button
                                onClick={closeEditor}
                                className="px-5 py-2.5 rounded-lg font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveRule}
                                className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-lg font-medium flex items-center space-x-2 shadow-lg shadow-indigo-900/20 active:translate-y-0.5 transition-all"
                            >
                                <Save className="w-4 h-4" />
                                <span>{editingRuleId ? 'Update Rule' : 'Create Rule'}</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Rules List */}
            <div className={`space-y-4 ${isCreating || viewingRule ? 'opacity-50 pointer-events-none' : ''}`}>
                {rules.map(rule => (
                    <div
                        key={rule.id}
                        onClick={() => setViewingRule(rule)}
                        className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl flex justify-between items-center group hover:border-indigo-500/50 cursor-pointer transition-all"
                    >
                        <div className="space-y-1">
                            <h4 className="font-semibold text-white group-hover:text-indigo-400 transition-colors">{rule.name}</h4>
                            <div className="flex space-x-4 text-xs text-slate-500">
                                <span>{rule.conditions?.length || 0} Conditions</span>
                                <span>{rule.actions?.length || 0} Actions</span>
                                <span className={rule.isActive ? "text-green-500" : "text-yellow-500"}>{rule.isActive ? "Active" : "Inactive"}</span>
                            </div>
                        </div>
                        <div className="flex space-x-2" onClick={(e) => e.stopPropagation()}>
                            <button onClick={() => handleEditClick(rule)} className="p-2 text-slate-600 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
                                <Edit2 className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDeleteRule(rule.id)} className="p-2 text-slate-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}
                {rules.length === 0 && !loading && (
                    <div className="text-center py-8 text-slate-500 text-sm">No rules defined.</div>
                )}
            </div>
        </div>
    );
}
