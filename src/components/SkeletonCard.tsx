export function SkeletonCard() {
    return (
        <div className="flex flex-col space-y-3">
            <div className="animate-pulse h-48 w-full rounded-xl bg-slate-800" />
            <div className="animate-pulse h-4 w-[250px] rounded bg-slate-800" />
            <div className="animate-pulse h-4 w-[200px] rounded bg-slate-800" />
        </div>
    );
}