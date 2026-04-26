export default function Table({ columns, data, emptyMessage = 'No records found.' }) {
  return (
    <div className="overflow-x-auto rounded-2xl border overflow-hidden"
      style={{ borderColor: '#d1fae5', boxShadow: '0 1px 3px rgba(16,185,129,0.06)' }}>
      <table className="w-full text-sm bg-white">
        <thead>
          <tr style={{ background: 'linear-gradient(135deg,#f0fdf4,#dcfce7)', borderBottom: '2px solid #bbf7d0' }}>
            {columns.map(col => (
              <th key={col.key}
                className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider"
                style={{ color: '#15803d' }}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-12 text-center text-gray-400">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, i) => (
              <tr key={i}
                className="transition-colors"
                style={{
                  borderBottom: '1px solid #f0fdf4',
                  background: i % 2 === 0 ? 'white' : '#f9fefb',
                }}>
                {columns.map(col => (
                  <td key={col.key} className="px-4 py-3 text-gray-700">
                    {col.render ? col.render(row) : row[col.key] ?? '—'}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
