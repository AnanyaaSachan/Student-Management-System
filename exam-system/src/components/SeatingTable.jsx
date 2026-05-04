import { useMemo, useRef } from 'react';
import { Printer } from 'lucide-react';
import { generateRoomGrid } from '../utils/generateSeating';
import './SeatingTable.css';

// ── Shared cell renderer ──────────────────────────────────────────────────────
function RollCell({ cell, isGap }) {
  if (isGap) return <td className="gap-cell" />;
  if (!cell) return <td className="empty-cell" />;
  const roll = cell.student?.roll_no || '';
  const isRepeat = roll.startsWith('R-');
  const isMTech  = roll.startsWith('255PCS') || roll.startsWith('255PCW');
  const cls = isRepeat ? 'roll-cell roll-repeat'
            : isMTech  ? 'roll-cell roll-mtech'
            : 'roll-cell';
  return (
    <td className={cls} title={`Seat ${cell.seat_no} · ${cell.course?.code || ''}`}>
      {roll}
    </td>
  );
}

// ── Student Detail summary ────────────────────────────────────────────────────
function StudentDetail({ courseSummary, total }) {
  if (!courseSummary || courseSummary.length === 0) return null;
  return (
    <div className="student-detail">
      <h3>Student Detail</h3>
      <table className="detail-table">
        <thead>
          <tr>
            <th style={{ width: '40px' }}>S.No.</th>
            <th>Student Detail</th>
            <th style={{ width: '110px', textAlign: 'right' }}>No. of Students</th>
          </tr>
        </thead>
        <tbody>
          {courseSummary.map((c, i) => (
            <tr key={c.code}>
              <td>{i + 1}</td>
              <td>{c.section} — {c.code} {c.name}</td>
              <td>{c.count}</td>
            </tr>
          ))}
          <tr className="total-row">
            <td colSpan={2} style={{ textAlign: 'right' }}>Total</td>
            <td>{total}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

// ── NB ROOM table (New Building IL-series) ────────────────────────────────────
// 3 sections, each with WHITE BOARD, separated by gaps
// Row: [S1×4 | gap(4) | S2×6 | gap(11) | S3×4]
function NBRoomTable({ rows }) {
  return (
    <table className="seating-table seating-table-nb">
      <thead>
        <tr className="wb-row">
          <td colSpan={4} className="wb-cell">WHITE BOARD</td>
          <td className="wb-gap" />
          <td colSpan={6} className="wb-cell">WHITE BOARD</td>
          <td className="wb-gap" />
          <td colSpan={4} className="wb-cell">WHITE BOARD</td>
        </tr>
        <tr className="desk-row">
          <td colSpan={2}>DESK-1</td>
          <td colSpan={2}>DESK-2</td>
          <td className="desk-gap" />
          <td colSpan={2}>DESK-1</td>
          <td colSpan={2}>DESK-2</td>
          <td colSpan={2}>DESK-3</td>
          <td className="desk-gap" />
          <td colSpan={2}>DESK-1</td>
          <td colSpan={2}>DESK-2</td>
        </tr>
      </thead>
      <tbody>
        {rows.map((row, ri) => (
          <tr key={ri} className="data-row">
            {row.map((cell, ci) => (
              <RollCell key={ci} cell={cell} isGap={ci === 4 || ci === 11} />
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// ── SMALL ROOM table (IT-series) ──────────────────────────────────────────────
function SmallRoomTable({ rows, numCols }) {
  return (
    <table className="seating-table seating-table-small">
      <thead>
        <tr className="wb-row">
          <td colSpan={numCols} className="wb-cell">WHITE BOARD</td>
        </tr>
      </thead>
      <tbody>
        {rows.map((row, ri) => (
          <tr key={ri} className="data-row">
            {row.map((cell, ci) => (
              <RollCell key={ci} cell={cell} isGap={false} />
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// ── LARGE ROOM table (IL-series SOICT) ───────────────────────────────────────
function LargeRoomTable({ rows }) {
  return (
    <table className="seating-table">
      <thead>
        <tr className="wb-row">
          <td colSpan={6} className="wb-cell">WHITE BOARD</td>
          <td className="wb-gap" />
          <td colSpan={6} className="wb-cell">WHITE BOARD</td>
        </tr>
        <tr className="desk-row">
          <td colSpan={2}>DESK-1</td>
          <td colSpan={2}>DESK-2</td>
          <td colSpan={2}>DESK-3</td>
          <td className="desk-gap" />
          <td colSpan={2}>DESK-1</td>
          <td colSpan={2}>DESK-2</td>
          <td colSpan={2}>DESK-3</td>
        </tr>
      </thead>
      <tbody>
        {rows.map((row, ri) => (
          <tr key={ri} className="data-row">
            {row.map((cell, ci) => (
              <RollCell key={ci} cell={cell} isGap={ci === 6} />
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// ── Main SeatingTable component ───────────────────────────────────────────────
/**
 * Props:
 *   room        – { room_no, building }
 *   examDate    – string e.g. '14-03-2026'
 *   shift       – string e.g. 'Evening Shift (03:00 pm – 04:30 pm)'
 *   allocations – array of enriched allocation objects
 */
export default function SeatingTable({ room, examDate, shift, allocations }) {
  const printRef = useRef(null);

  const sorted = useMemo(
    () => [...allocations].sort((a, b) => a.seat_no - b.seat_no),
    [allocations]
  );

  const grid = useMemo(
    () => generateRoomGrid(sorted, room?.room_no || '', room?.building || ''),
    [sorted, room?.room_no, room?.building]
  );

  const courseSummary = useMemo(() => {
    const map = {};
    sorted.forEach(a => {
      const code = a.course?.code || '--';
      if (!map[code]) map[code] = { code, name: a.course?.name || '', section: a.student?.section || '', count: 0 };
      map[code].count++;
    });
    return Object.values(map);
  }, [sorted]);

  const handlePrint = () => {
    if (printRef.current) printRef.current.classList.add('seating-print-root');
    window.print();
    if (printRef.current) printRef.current.classList.remove('seating-print-root');
  };

  if (allocations.length === 0) {
    return (
      <div style={{ padding: '32px', textAlign: 'center', color: '#9ca3af', fontSize: '13px' }}>
        No students in this room
      </div>
    );
  }

  return (
    <div ref={printRef}>
      {/* Header + print button */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '16px 20px 0' }}>
        <div className="seating-header" style={{ flex: 1 }}>
          <h2>Room No — {room?.room_no}</h2>
          <p>{shift}&nbsp;&nbsp;{examDate}</p>
        </div>
        <button className="print-btn" onClick={handlePrint} style={{ marginTop: '4px', flexShrink: 0 }}>
          <Printer size={13} />
          Print Seating Plan
        </button>
      </div>

      <div className="seating-wrapper">
        {grid.layout === 'nb'    && <NBRoomTable    rows={grid.rows} />}
        {grid.layout === 'small' && <SmallRoomTable rows={grid.rows} numCols={grid.numCols} />}
        {grid.layout === 'large' && <LargeRoomTable rows={grid.rows} />}

        <StudentDetail courseSummary={courseSummary} total={sorted.length} />
      </div>
    </div>
  );
}
