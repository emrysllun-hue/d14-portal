'use client';

export default function DeleteUserButton() {
  return (
    <button 
      type="submit" 
      onClick={(e) => {
        if (!confirm('Are you sure you want to permanently delete this user? This action cannot be undone.')) {
          e.preventDefault();
        }
      }}
      className="text-[10px] bg-red-600 text-white hover:bg-red-700 px-2 py-1.5 rounded-lg font-bold transition-colors uppercase tracking-wider"
    >
      Delete
    </button>
  );
}