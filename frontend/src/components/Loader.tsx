export default function Loader({ size = 'md', text }: { size?: 'sm' | 'md' | 'lg'; text?: string }) {
  const sizeMap = { sm: 'w-5 h-5', md: 'w-8 h-8', lg: 'w-12 h-12' };

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className={`${sizeMap[size]} border-2 border-white/10 border-t-brand-500 rounded-full animate-spin`} />
      {text && <p className="text-sm text-white/40">{text}</p>}
    </div>
  );
}
