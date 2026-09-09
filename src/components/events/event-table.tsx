import Link from "next/link";
import { FitScoreBadge } from "./fit-score-badge";
import { PriorityIndicator } from "./priority-indicator";
import { BusinessLineChip } from "./business-line-chip";
import { Eye, Edit, Trash2, ExternalLink } from "lucide-react";
import { useSession } from "next-auth/react";

interface EventTableProps {
  events: any[];
  onDelete?: (id: number) => void;
  onEdit?: (event: any) => void;
}

export function EventTable({ events, onDelete, onEdit }: EventTableProps) {
  const { data: session } = useSession();
  const userRole = (session?.user as any)?.role || "INTERN";

  if (!events || events.length === 0) {
    return null;
  }

  return (
    <div className="w-full overflow-x-auto rounded-[12px] border-[1.5px] border-[#D8D2C8] dark:border-[#1E4830] bg-white dark:bg-[#133020] shadow-sm font-manrope transition-colors">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-emerald-950 dark:bg-black/50 text-white text-[10.5px] uppercase tracking-[0.08em] font-semibold border-b border-emerald-900 dark:border-[#1E4830]">
            <th className="py-3.5 px-4 text-center w-12">#</th>
            <th className="py-3.5 px-4 min-w-[240px]">Event name</th>
            <th className="py-3.5 px-4 min-w-[120px]">Dates</th>
            <th className="py-3.5 px-4 min-w-[140px]">City / Country</th>
            <th className="py-3.5 px-4 min-w-[180px]">Business lines</th>
            <th className="py-3.5 px-4 text-center w-20">Fit</th>
            <th className="py-3.5 px-4 text-center w-24">Priority</th>
            <th className="py-3.5 px-4 min-w-[100px]">Action</th>
            <th className="py-3.5 px-4 text-right min-w-[100px]">Manage</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#D8D2C8] dark:divide-[#1E4830] text-xs text-emerald-950 dark:text-slate-100">
          {events.map((evt) => {
            let businessLines: string[] = [];
            try {
              businessLines = JSON.parse(evt.businessLines || "[]");
            } catch {
              businessLines = Array.isArray(evt.businessLines)
                ? evt.businessLines
                : [evt.businessLines];
            }

            return (
              <tr
                key={evt.id}
                className="hover:bg-emerald-900/5 dark:hover:bg-white/5 transition-colors duration-150"
              >
                <td className="py-3 px-4 font-bold text-center text-emerald-800/70 dark:text-slate-400">
                  {evt.eventNumber}
                </td>
                <td className="py-3 px-4">
                  <Link
                    href={`/events/${evt.id}`}
                    className="font-semibold text-emerald-950 dark:text-white hover:text-amber-500 transition line-clamp-2"
                  >
                    {evt.eventName}
                  </Link>
                  <span className="text-[11px] text-emerald-800/70 dark:text-slate-400 block truncate mt-0.5">
                    {evt.venue}
                  </span>
                </td>
                <td className="py-3 px-4 font-medium text-emerald-950 dark:text-slate-200 whitespace-nowrap">
                  {evt.dates}
                </td>
                <td className="py-3 px-4 whitespace-nowrap">
                  <span className="font-semibold text-emerald-950 dark:text-slate-100">
                    {evt.city}
                  </span>
                  <span className="text-emerald-800/70 dark:text-slate-400 block text-[11px]">
                    {evt.country} ({evt.region})
                  </span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-1 flex-wrap">
                    {businessLines.slice(0, 2).map((bl) => (
                      <BusinessLineChip key={bl} name={bl} />
                    ))}
                    {businessLines.length > 2 && (
                      <span className="text-[10px] text-emerald-800/70 dark:text-slate-400 font-semibold">
                        +{businessLines.length - 2}
                      </span>
                    )}
                  </div>
                </td>
                <td className="py-3 px-4 text-center">
                  <div className="flex justify-center">
                    <FitScoreBadge score={evt.fitScore} />
                  </div>
                </td>
                <td className="py-3 px-4 text-center">
                  <div className="flex justify-center">
                    <PriorityIndicator priority={evt.priorityLevel} />
                  </div>
                </td>
                <td className="py-3 px-4 whitespace-nowrap">
                  <span className="inline-block px-2 py-0.5 rounded bg-emerald-500/10 dark:bg-amber-400/10 text-emerald-700 dark:text-amber-300 font-semibold text-[11px]">
                    {evt.participationRec}
                  </span>
                </td>
                <td className="py-3 px-4 text-right whitespace-nowrap">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/events/${evt.id}`}
                      title="View Details"
                      className="p-1.5 text-emerald-700 dark:text-amber-400 hover:bg-emerald-500/10 rounded transition"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                    {(userRole === "ADMIN" || userRole === "SUPERVISOR") && (
                      <button
                        onClick={() => onEdit ? onEdit(evt) : null}
                        title="Edit Event"
                        className="p-1.5 text-[#133020] hover:bg-[#133020]/10 rounded transition"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    )}
                    {userRole === "ADMIN" && onDelete && (
                      <button
                        onClick={() => onDelete(evt.id)}
                        title="Delete Event"
                        className="p-1.5 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 rounded transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
