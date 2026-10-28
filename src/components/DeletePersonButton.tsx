'use client';

export default function DeletePersonButton() {
  return (
    <button 
      type="submit" 
      onClick={(e) => {
        if (!confirm('Are you sure you want to permanently delete this record? Any links to incidents will also be removed.')) {
          e.preventDefault();
        }
      }}
      className="text-red-600 hover:text-red-800 font-semibold transition-colors"
    >
      Delete
    </button>
  );
}