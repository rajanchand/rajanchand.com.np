interface SectionHeaderProps {
  label: string;
  title: string;
  description?: string;
  center?: boolean;
}

export function SectionHeader({
  label,
  title,
  description,
  center = true,
}: SectionHeaderProps) {
  return (
    <div className={`mb-16 ${center ? "text-center" : ""}`}>
      <span className="inline-flex items-center gap-2 font-mono text-xs tracking-[3px] uppercase text-[var(--accent)] mb-4">
        <span className="inline-block w-7 h-0.5 bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] rounded-full" />
        {label}
      </span>
      <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold font-[var(--font-display)] text-slate-900 dark:text-white tracking-tight leading-tight mb-4">
        {title}
      </h2>
      {description && (
        <p
          className={`text-[var(--muted-foreground)] text-base md:text-lg max-w-2xl leading-relaxed ${
            center ? "mx-auto" : ""
          }`}
        >
          {description}
        </p>
      )}
    </div>
  );
}
